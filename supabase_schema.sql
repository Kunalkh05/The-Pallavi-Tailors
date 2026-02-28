-- StitchEase Supabase Initialization Script
-- Execute this script in your Supabase project's SQL Editor

-- 1. Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Businesses Table (Multi-tenant)
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    subscription_plan TEXT DEFAULT 'basic',
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role TEXT CHECK (role IN ('customer', 'admin', 'super_admin')) DEFAULT 'customer',
    business_id UUID REFERENCES public.businesses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders Table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    business_id UUID REFERENCES public.businesses(id),
    dress_type TEXT NOT NULL,
    fabric_type TEXT,
    price DECIMAL(10,2),
    status TEXT CHECK (status IN ('Order Confirmed', 'Cutting', 'Stitching', 'Trial', 'Ready', 'Delivered')) DEFAULT 'Order Confirmed',
    delivery_date DATE,
    urgency_level TEXT DEFAULT 'Normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Measurements Table
CREATE TABLE public.measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    bust DECIMAL(5,2),
    waist DECIMAL(5,2),
    hip DECIMAL(5,2),
    shoulder DECIMAL(5,2),
    sleeve_length DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('Pending', 'Partial', 'Completed', 'Failed')) DEFAULT 'Pending',
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Row Level Security (RLS) Configuration

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for "users"
-- Users can create their own profile on registration
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
-- Users can see their own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Admins can view all users in their business
CREATE POLICY "Admins can view users in their business" ON public.users FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'super_admin') 
    AND business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
);

-- Policies for "orders"
-- Customers can view their own orders
CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
-- Admins can view and manage all orders in their business
CREATE POLICY "Admins can view orders in their business" ON public.orders FOR SELECT USING (
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Admins can insert orders" ON public.orders FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'super_admin')
);
CREATE POLICY "Admins can update orders in their business" ON public.orders FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'super_admin')
    AND business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
);

-- Policies for "measurements"
-- Customers can view and update their own measurements
CREATE POLICY "Customers can view own measurements" ON public.measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers can update own measurements" ON public.measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Customers can insert own measurements" ON public.measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins can view measurements of customers in their business orders
CREATE POLICY "Admins can view measurements" ON public.measurements FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.user_id = measurements.user_id AND orders.business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()))
);
