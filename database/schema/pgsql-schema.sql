--
-- PostgreSQL database dump
--

\restrict 6hA8w1TtChJNmYlZ3bL3ySVVt2dCc7wScMuBR6JXUCowxhNB5VaxUrVAQQOd05x

-- Dumped from database version 18.0 (Homebrew)
-- Dumped by pg_dump version 18.0 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approval_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_requests (
    id bigint NOT NULL,
    approvable_type character varying(255) NOT NULL,
    approvable_id bigint NOT NULL,
    approval_rule_id bigint NOT NULL,
    approver_id bigint NOT NULL,
    level integer NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    notes text,
    responded_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT approval_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: approval_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.approval_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: approval_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.approval_requests_id_seq OWNED BY public.approval_requests.id;


--
-- Name: approval_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_rules (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    entity_type character varying(255) NOT NULL,
    min_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    max_amount numeric(15,2),
    role_id bigint,
    user_id bigint,
    level integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: approval_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.approval_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: approval_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.approval_rules_id_seq OWNED BY public.approval_rules.id;


--
-- Name: approval_task_delegations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_task_delegations (
    id bigint NOT NULL,
    approval_task_id bigint NOT NULL,
    from_user_id bigint NOT NULL,
    to_user_id bigint NOT NULL,
    delegated_at timestamp(0) without time zone NOT NULL,
    expires_at timestamp(0) without time zone,
    reason text,
    created_by bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: approval_task_delegations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.approval_task_delegations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: approval_task_delegations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.approval_task_delegations_id_seq OWNED BY public.approval_task_delegations.id;


--
-- Name: approval_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_tasks (
    id bigint NOT NULL,
    workflow_instance_id bigint NOT NULL,
    workflow_step_id bigint NOT NULL,
    assigned_to_user_id bigint,
    assigned_to_role_id bigint,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    approved_by bigint,
    approved_at timestamp(0) without time zone,
    rejection_reason text,
    comments text,
    due_at timestamp(0) without time zone,
    escalated_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT approval_tasks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'delegated'::character varying, 'escalated'::character varying, 'skipped'::character varying])::text[])))
);


--
-- Name: approval_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.approval_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: approval_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.approval_tasks_id_seq OWNED BY public.approval_tasks.id;


--
-- Name: asset_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_categories (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    depreciation_method character varying(255) DEFAULT 'straight_line'::character varying NOT NULL,
    useful_life_years integer NOT NULL,
    asset_account_id bigint NOT NULL,
    accumulated_depreciation_account_id bigint NOT NULL,
    depreciation_expense_account_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: asset_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asset_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asset_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asset_categories_id_seq OWNED BY public.asset_categories.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assets (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    asset_number character varying(255) NOT NULL,
    category_id bigint NOT NULL,
    purchase_date date NOT NULL,
    start_depreciation_date date NOT NULL,
    cost numeric(15,2) NOT NULL,
    salvage_value numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    serial_number character varying(255),
    location character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- Name: attendances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendances (
    id bigint NOT NULL,
    employee_id bigint NOT NULL,
    date date NOT NULL,
    clock_in time(0) without time zone,
    clock_out time(0) without time zone,
    status character varying(255) DEFAULT 'present'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attendances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- Name: blanket_order_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blanket_order_lines (
    id bigint NOT NULL,
    blanket_order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    quantity_agreed numeric(15,2),
    quantity_ordered numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: blanket_order_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blanket_order_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blanket_order_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blanket_order_lines_id_seq OWNED BY public.blanket_order_lines.id;


--
-- Name: blanket_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blanket_orders (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    purchase_agreement_id bigint,
    number character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    amount_limit numeric(15,2) NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    renewal_reminder_days integer DEFAULT 30 NOT NULL,
    is_auto_renew boolean DEFAULT false NOT NULL
);


--
-- Name: blanket_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blanket_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blanket_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blanket_orders_id_seq OWNED BY public.blanket_orders.id;


--
-- Name: budget_encumbrances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_encumbrances (
    id bigint NOT NULL,
    budget_id bigint NOT NULL,
    encumberable_type character varying(255) NOT NULL,
    encumberable_id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT budget_encumbrances_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'released'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: budget_encumbrances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_encumbrances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_encumbrances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_encumbrances_id_seq OWNED BY public.budget_encumbrances.id;


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    department_id bigint,
    account_id bigint,
    fiscal_year integer NOT NULL,
    period_type character varying(255) DEFAULT 'annual'::character varying NOT NULL,
    period_number smallint DEFAULT '1'::smallint NOT NULL,
    amount numeric(15,2) NOT NULL,
    warning_threshold numeric(5,2) DEFAULT '80'::numeric NOT NULL,
    is_strict boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT budgets_period_type_check CHECK (((period_type)::text = ANY ((ARRAY['annual'::character varying, 'quarterly'::character varying, 'monthly'::character varying])::text[])))
);


--
-- Name: budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budgets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budgets_id_seq OWNED BY public.budgets.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'product'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT categories_type_check CHECK (((type)::text = ANY ((ARRAY['product'::character varying, 'contact'::character varying])::text[])))
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chart_of_accounts (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    parent_id bigint,
    description text
);


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chart_of_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chart_of_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chart_of_accounts_id_seq OWNED BY public.chart_of_accounts.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(255),
    address text,
    logo_path character varying(2048),
    currency character varying(255) DEFAULT 'IDR'::character varying NOT NULL,
    tax_id character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: COLUMN companies.tax_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.companies.tax_id IS 'NPWP';


--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id bigint NOT NULL,
    type character varying(255) DEFAULT 'customer'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(255),
    address text,
    tax_id character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    rating_score numeric(3,2),
    on_time_rate numeric(5,2),
    quality_rate numeric(5,2),
    return_rate numeric(5,2),
    last_score_update timestamp(0) without time zone,
    payment_term_id bigint,
    documents json,
    bank_name character varying(255),
    bank_account_number character varying(255),
    bank_account_holder character varying(255),
    bank_swift_code character varying(255),
    currency character varying(3) DEFAULT 'IDR'::character varying NOT NULL,
    company_registration_no character varying(255),
    established_year integer,
    employee_count integer,
    website character varying(255),
    notes text,
    category character varying(255),
    industry character varying(255),
    tags json,
    contact_persons json,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT contacts_type_check CHECK (((type)::text = ANY ((ARRAY['customer'::character varying, 'vendor'::character varying, 'both'::character varying])::text[])))
);


--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: customer_invoice_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_invoice_lines (
    id bigint NOT NULL,
    customer_invoice_id bigint NOT NULL,
    product_id bigint,
    description character varying(255) NOT NULL,
    quantity numeric(15,2) DEFAULT '1'::numeric NOT NULL,
    unit_price numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: customer_invoice_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_invoice_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_invoice_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_invoice_lines_id_seq OWNED BY public.customer_invoice_lines.id;


--
-- Name: customer_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_invoices (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    invoice_number character varying(255) NOT NULL,
    reference_number character varying(255),
    date date NOT NULL,
    due_date date,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    exchange_rate numeric(15,6) DEFAULT '1'::numeric NOT NULL
);


--
-- Name: customer_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_invoices_id_seq OWNED BY public.customer_invoices.id;


--
-- Name: customer_payment_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_payment_lines (
    id bigint NOT NULL,
    customer_payment_id bigint NOT NULL,
    customer_invoice_id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: customer_payment_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_payment_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_payment_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_payment_lines_id_seq OWNED BY public.customer_payment_lines.id;


--
-- Name: customer_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_payments (
    id bigint NOT NULL,
    payment_number character varying(255) NOT NULL,
    customer_id bigint NOT NULL,
    date date NOT NULL,
    amount numeric(15,2) NOT NULL,
    reference character varying(255),
    payment_method character varying(255) DEFAULT 'bank_transfer'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    exchange_rate numeric(15,6) DEFAULT '1'::numeric NOT NULL
);


--
-- Name: customer_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_payments_id_seq OWNED BY public.customer_payments.id;


--
-- Name: deals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deals (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    stage character varying(255) DEFAULT 'prospecting'::character varying NOT NULL,
    close_date date,
    contact_id bigint,
    lead_id bigint,
    owner_id bigint,
    probability integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: deals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deals_id_seq OWNED BY public.deals.id;


--
-- Name: delivery_order_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_order_lines (
    id bigint NOT NULL,
    delivery_order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity_ordered numeric(15,2) NOT NULL,
    quantity_done numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: delivery_order_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delivery_order_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delivery_order_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delivery_order_lines_id_seq OWNED BY public.delivery_order_lines.id;


--
-- Name: delivery_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_orders (
    id bigint NOT NULL,
    sales_order_id bigint,
    warehouse_id bigint NOT NULL,
    delivery_number character varying(255) NOT NULL,
    date date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    tracking_number character varying(255),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: delivery_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.delivery_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delivery_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.delivery_orders_id_seq OWNED BY public.delivery_orders.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    parent_id bigint,
    manager_id bigint,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: depreciation_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.depreciation_entries (
    id bigint NOT NULL,
    asset_id bigint NOT NULL,
    gl_entry_id bigint NOT NULL,
    date date NOT NULL,
    amount numeric(15,2) NOT NULL,
    book_value_after numeric(15,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: depreciation_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.depreciation_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: depreciation_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.depreciation_entries_id_seq OWNED BY public.depreciation_entries.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id bigint NOT NULL,
    user_id bigint,
    department_id bigint,
    manager_id bigint,
    employee_id character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(255),
    job_title character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    join_date date NOT NULL,
    date_of_birth date,
    gender character varying(255),
    address text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: goods_receipt_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipt_items (
    id bigint NOT NULL,
    goods_receipt_id bigint NOT NULL,
    product_id bigint NOT NULL,
    uom_id bigint NOT NULL,
    quantity_received numeric(15,2) NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    landed_cost_total numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    qc_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    qc_passed_qty integer DEFAULT 0 NOT NULL,
    qc_failed_qty integer DEFAULT 0 NOT NULL,
    qc_notes text,
    qc_by bigint,
    qc_at timestamp(0) without time zone,
    CONSTRAINT goods_receipt_items_qc_status_check CHECK (((qc_status)::text = ANY ((ARRAY['pending'::character varying, 'in_qa'::character varying, 'passed'::character varying, 'failed'::character varying, 'partial'::character varying])::text[])))
);


--
-- Name: goods_receipt_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_receipt_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_receipt_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_receipt_items_id_seq OWNED BY public.goods_receipt_items.id;


--
-- Name: goods_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipts (
    id bigint NOT NULL,
    purchase_order_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    receipt_number character varying(255) NOT NULL,
    date date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    notes text,
    received_by bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    received_at timestamp(0) without time zone,
    delivery_note_number character varying(255),
    physical_condition text,
    posted_by bigint,
    posted_at timestamp(0) without time zone,
    cancelled_by bigint,
    cancelled_at timestamp(0) without time zone,
    cancellation_reason text
);


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_receipts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_receipts_id_seq OWNED BY public.goods_receipts.id;


--
-- Name: inventory_count_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_count_lines (
    id bigint NOT NULL,
    inventory_count_id bigint NOT NULL,
    product_id bigint NOT NULL,
    theoretical_qty numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    counted_qty numeric(15,2),
    difference numeric(15,2),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: inventory_count_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_count_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_count_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_count_lines_id_seq OWNED BY public.inventory_count_lines.id;


--
-- Name: inventory_counts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_counts (
    id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    date date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    type character varying(255) DEFAULT 'opname'::character varying NOT NULL,
    description character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: inventory_counts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_counts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_counts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_counts_id_seq OWNED BY public.inventory_counts.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id bigint NOT NULL,
    reference_number character varying(255),
    date date NOT NULL,
    description text,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    exchange_rate numeric(15,6) DEFAULT '1'::numeric NOT NULL
);


--
-- Name: journal_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.journal_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: journal_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.journal_entries_id_seq OWNED BY public.journal_entries.id;


--
-- Name: journal_entry_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entry_lines (
    id bigint NOT NULL,
    journal_entry_id bigint NOT NULL,
    chart_of_account_id bigint NOT NULL,
    debit numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    credit numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: journal_entry_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.journal_entry_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: journal_entry_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.journal_entry_lines_id_seq OWNED BY public.journal_entry_lines.id;


--
-- Name: landed_cost_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.landed_cost_allocations (
    id bigint NOT NULL,
    landed_cost_id bigint NOT NULL,
    goods_receipt_item_id bigint NOT NULL,
    allocated_amount numeric(15,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: landed_cost_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.landed_cost_allocations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: landed_cost_allocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.landed_cost_allocations_id_seq OWNED BY public.landed_cost_allocations.id;


--
-- Name: landed_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.landed_costs (
    id bigint NOT NULL,
    goods_receipt_id bigint NOT NULL,
    cost_type character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    amount numeric(15,2) NOT NULL,
    allocation_method character varying(255) DEFAULT 'by_value'::character varying NOT NULL,
    expense_account_id bigint,
    reference_number character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT landed_costs_allocation_method_check CHECK (((allocation_method)::text = ANY ((ARRAY['by_value'::character varying, 'by_quantity'::character varying, 'by_weight'::character varying])::text[])))
);


--
-- Name: landed_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.landed_costs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: landed_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.landed_costs_id_seq OWNED BY public.landed_costs.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id bigint NOT NULL,
    title character varying(255),
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    email character varying(255),
    phone character varying(255),
    company_name character varying(255),
    status character varying(255) DEFAULT 'new'::character varying NOT NULL,
    source character varying(255),
    owner_id bigint,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_requests (
    id bigint NOT NULL,
    employee_id bigint NOT NULL,
    leave_type character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    reason text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    approver_id bigint,
    rejection_reason text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: payment_terms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_terms (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    type character varying(255) DEFAULT 'standard'::character varying NOT NULL,
    days_due integer,
    schedule_definition json,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: payment_terms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_terms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_terms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_terms_id_seq OWNED BY public.payment_terms.id;


--
-- Name: payroll_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_runs (
    id bigint NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    pay_date date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: payroll_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payroll_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payroll_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payroll_runs_id_seq OWNED BY public.payroll_runs.id;


--
-- Name: payslips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payslips (
    id bigint NOT NULL,
    payroll_run_id bigint NOT NULL,
    employee_id bigint NOT NULL,
    basic_salary numeric(15,2) NOT NULL,
    allowances json,
    deductions json,
    gross_salary numeric(15,2) NOT NULL,
    total_deductions numeric(15,2) NOT NULL,
    net_salary numeric(15,2) NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: payslips_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payslips_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payslips_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payslips_id_seq OWNED BY public.payslips.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: price_list_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_list_items (
    id bigint NOT NULL,
    price_list_id bigint NOT NULL,
    product_id bigint NOT NULL,
    price numeric(15,2) NOT NULL,
    min_quantity numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: price_list_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.price_list_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: price_list_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.price_list_items_id_seq OWNED BY public.price_list_items.id;


--
-- Name: price_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_lists (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    currency character varying(3) DEFAULT 'IDR'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: price_lists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.price_lists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: price_lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.price_lists_id_seq OWNED BY public.price_lists.id;


--
-- Name: product_warehouse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_warehouse (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    quantity numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: product_warehouse_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_warehouse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_warehouse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_warehouse_id_seq OWNED BY public.product_warehouse.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'goods'::character varying NOT NULL,
    price numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    cost numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    stock_control boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    uom_id bigint,
    CONSTRAINT products_type_check CHECK (((type)::text = ANY ((ARRAY['goods'::character varying, 'service'::character varying])::text[])))
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_agreements (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    reference_number character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    document_path character varying(255),
    total_value_cap numeric(15,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    renewal_reminder_days integer DEFAULT 30 NOT NULL,
    is_auto_renew boolean DEFAULT false NOT NULL
);


--
-- Name: purchase_agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_agreements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_agreements_id_seq OWNED BY public.purchase_agreements.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id bigint NOT NULL,
    purchase_order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    description character varying(255),
    quantity numeric(15,2) NOT NULL,
    uom_id bigint,
    unit_price numeric(15,2) NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    quantity_received numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    quantity_billed numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tax_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_order_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_versions (
    id bigint NOT NULL,
    purchase_order_id bigint NOT NULL,
    version_number integer NOT NULL,
    change_type character varying(255) NOT NULL,
    change_summary text,
    snapshot json NOT NULL,
    changes json,
    created_by bigint,
    created_at timestamp(0) without time zone NOT NULL
);


--
-- Name: purchase_order_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_versions_id_seq OWNED BY public.purchase_order_versions.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    document_number character varying(255) NOT NULL,
    date date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    total numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    cancellation_reason text,
    purchase_request_id bigint,
    payment_term_id bigint,
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tax_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    withholding_tax_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    withholding_tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tax_inclusive boolean DEFAULT false NOT NULL,
    source character varying(255) DEFAULT 'manual'::character varying NOT NULL,
    blanket_order_id bigint
);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: purchase_request_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_request_items (
    id bigint NOT NULL,
    purchase_request_id bigint NOT NULL,
    product_id bigint NOT NULL,
    description text,
    quantity numeric(10,2) NOT NULL,
    uom_id bigint NOT NULL,
    estimated_unit_price numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    estimated_total numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: purchase_request_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_request_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_request_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_request_items_id_seq OWNED BY public.purchase_request_items.id;


--
-- Name: purchase_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_requests (
    id bigint NOT NULL,
    document_number character varying(255) NOT NULL,
    requester_id bigint NOT NULL,
    department_id bigint,
    date date NOT NULL,
    required_date date,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    notes text,
    rejection_reason text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


--
-- Name: purchase_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_requests_id_seq OWNED BY public.purchase_requests.id;


--
-- Name: purchase_return_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_return_lines (
    id bigint NOT NULL,
    purchase_return_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity numeric(15,4) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total numeric(15,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: purchase_return_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_return_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_return_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_return_lines_id_seq OWNED BY public.purchase_return_lines.id;


--
-- Name: purchase_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_returns (
    id bigint NOT NULL,
    document_number character varying(255) NOT NULL,
    vendor_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    date date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: purchase_returns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_returns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_returns_id_seq OWNED BY public.purchase_returns.id;


--
-- Name: purchase_rfq_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_rfq_lines (
    id bigint NOT NULL,
    purchase_rfq_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity numeric(10,2) NOT NULL,
    uom character varying(255),
    target_price numeric(15,2),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    uom_id bigint
);


--
-- Name: purchase_rfq_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_rfq_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_rfq_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_rfq_lines_id_seq OWNED BY public.purchase_rfq_lines.id;


--
-- Name: purchase_rfq_vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_rfq_vendors (
    id bigint NOT NULL,
    purchase_rfq_id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    sent_at timestamp(0) without time zone,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: purchase_rfq_vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_rfq_vendors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_rfq_vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_rfq_vendors_id_seq OWNED BY public.purchase_rfq_vendors.id;


--
-- Name: purchase_rfqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_rfqs (
    id bigint NOT NULL,
    document_number character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    deadline date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    notes text,
    created_by bigint,
    purchase_request_id bigint
);


--
-- Name: purchase_rfqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_rfqs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_rfqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_rfqs_id_seq OWNED BY public.purchase_rfqs.id;


--
-- Name: qc_defect_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qc_defect_codes (
    id bigint NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    category character varying(255) DEFAULT 'minor'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT qc_defect_codes_category_check CHECK (((category)::text = ANY ((ARRAY['critical'::character varying, 'major'::character varying, 'minor'::character varying])::text[])))
);


--
-- Name: qc_defect_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.qc_defect_codes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: qc_defect_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.qc_defect_codes_id_seq OWNED BY public.qc_defect_codes.id;


--
-- Name: qc_inspections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qc_inspections (
    id bigint NOT NULL,
    inspector_id bigint NOT NULL,
    passed_qty integer NOT NULL,
    failed_qty integer NOT NULL,
    notes text,
    checklist_results json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    inspectable_type character varying(255),
    inspectable_id bigint,
    reference_number character varying(255),
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    quantity_inspected integer DEFAULT 0 NOT NULL
);


--
-- Name: qc_inspections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.qc_inspections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: qc_inspections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.qc_inspections_id_seq OWNED BY public.qc_inspections.id;


--
-- Name: rfq_vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rfq_vendors (
    id bigint NOT NULL,
    purchase_rfq_id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    status character varying(255) DEFAULT 'sent'::character varying NOT NULL,
    sent_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: rfq_vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rfq_vendors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rfq_vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rfq_vendors_id_seq OWNED BY public.rfq_vendors.id;


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sales_order_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_order_lines (
    id bigint NOT NULL,
    sales_order_id bigint NOT NULL,
    product_id bigint NOT NULL,
    description text,
    quantity numeric(15,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: sales_order_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_order_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_order_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_order_lines_id_seq OWNED BY public.sales_order_lines.id;


--
-- Name: sales_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_orders (
    id bigint NOT NULL,
    customer_id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    document_number character varying(255) NOT NULL,
    date date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    total numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: sales_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sales_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sales_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sales_orders_id_seq OWNED BY public.sales_orders.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: stock_moves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_moves (
    id bigint NOT NULL,
    warehouse_id bigint NOT NULL,
    product_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    quantity numeric(15,2) NOT NULL,
    date timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reference_type character varying(255),
    reference_id bigint,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: stock_moves_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_moves_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_moves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_moves_id_seq OWNED BY public.stock_moves.id;


--
-- Name: three_way_matches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.three_way_matches (
    id bigint NOT NULL,
    purchase_order_id bigint NOT NULL,
    goods_receipt_id bigint,
    vendor_bill_id bigint,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    qty_variance numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    price_variance numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    amount_variance numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    variance_percentage numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    discrepancies json,
    matched_at timestamp(0) without time zone,
    matched_by bigint,
    approved_by bigint,
    approved_at timestamp(0) without time zone,
    approval_notes text,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT three_way_matches_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'matched'::character varying, 'partial_match'::character varying, 'mismatch'::character varying, 'approved'::character varying])::text[])))
);


--
-- Name: three_way_matches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.three_way_matches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: three_way_matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.three_way_matches_id_seq OWNED BY public.three_way_matches.id;


--
-- Name: uoms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uoms (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    symbol character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: uoms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.uoms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: uoms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.uoms_id_seq OWNED BY public.uoms.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    two_factor_secret text,
    two_factor_recovery_codes text,
    two_factor_confirmed_at timestamp(0) without time zone,
    department_id bigint
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendor_audits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_audits (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    audit_type character varying(255) NOT NULL,
    audit_date date NOT NULL,
    auditor_id bigint NOT NULL,
    score numeric(5,2),
    status character varying(255) DEFAULT 'scheduled'::character varying NOT NULL,
    criteria_scores json,
    findings text,
    recommendations text,
    next_audit_date date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vendor_audits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_audits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_audits_id_seq OWNED BY public.vendor_audits.id;


--
-- Name: vendor_bill_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_bill_items (
    id bigint NOT NULL,
    vendor_bill_id bigint NOT NULL,
    product_id bigint,
    description character varying(255) NOT NULL,
    quantity numeric(15,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    total numeric(15,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tax_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL
);


--
-- Name: vendor_bill_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_bill_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_bill_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_bill_items_id_seq OWNED BY public.vendor_bill_items.id;


--
-- Name: vendor_bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_bills (
    id bigint NOT NULL,
    purchase_order_id bigint,
    vendor_id bigint NOT NULL,
    bill_number character varying(255) NOT NULL,
    reference_number character varying(255),
    date date NOT NULL,
    due_date date,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    match_status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    match_exceptions json,
    attachment_path character varying(255),
    subtotal numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tax_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    withholding_tax_rate numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    withholding_tax_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    tax_inclusive boolean DEFAULT false NOT NULL,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    exchange_rate numeric(15,6) DEFAULT '1'::numeric NOT NULL
);


--
-- Name: vendor_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_bills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_bills_id_seq OWNED BY public.vendor_bills.id;


--
-- Name: vendor_onboarding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_onboarding (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    documents json,
    checklist json,
    notes text,
    reviewed_by bigint,
    reviewed_at timestamp(0) without time zone,
    approved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vendor_onboarding_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_onboarding_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_onboarding_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_onboarding_id_seq OWNED BY public.vendor_onboarding.id;


--
-- Name: vendor_payment_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_payment_lines (
    id bigint NOT NULL,
    vendor_payment_id bigint NOT NULL,
    vendor_bill_id bigint NOT NULL,
    amount numeric(15,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vendor_payment_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_payment_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_payment_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_payment_lines_id_seq OWNED BY public.vendor_payment_lines.id;


--
-- Name: vendor_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_payments (
    id bigint NOT NULL,
    payment_number character varying(255) NOT NULL,
    vendor_id bigint NOT NULL,
    date date NOT NULL,
    amount numeric(15,2) NOT NULL,
    reference character varying(255),
    payment_method character varying(255) DEFAULT 'bank_transfer'::character varying NOT NULL,
    notes text,
    status character varying(255) DEFAULT 'posted'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    currency_code character(3) DEFAULT 'USD'::bpchar NOT NULL,
    exchange_rate numeric(15,6) DEFAULT '1'::numeric NOT NULL
);


--
-- Name: vendor_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_payments_id_seq OWNED BY public.vendor_payments.id;


--
-- Name: vendor_performance_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_performance_logs (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    metric_type character varying(255) NOT NULL,
    reference_type character varying(255) NOT NULL,
    reference_id bigint NOT NULL,
    value numeric(8,2) NOT NULL,
    description character varying(255),
    period_date date NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vendor_performance_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_performance_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_performance_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_performance_logs_id_seq OWNED BY public.vendor_performance_logs.id;


--
-- Name: vendor_pricelists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_pricelists (
    id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    product_id bigint NOT NULL,
    price numeric(15,2) NOT NULL,
    min_quantity numeric(10,2) DEFAULT '1'::numeric NOT NULL,
    vendor_product_code character varying(255),
    vendor_product_name character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vendor_pricelists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_pricelists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_pricelists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_pricelists_id_seq OWNED BY public.vendor_pricelists.id;


--
-- Name: vendor_quotation_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_quotation_lines (
    id bigint NOT NULL,
    vendor_quotation_id bigint NOT NULL,
    product_id bigint NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(15,2) NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: vendor_quotation_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_quotation_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_quotation_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_quotation_lines_id_seq OWNED BY public.vendor_quotation_lines.id;


--
-- Name: vendor_quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_quotations (
    id bigint NOT NULL,
    purchase_rfq_id bigint NOT NULL,
    vendor_id bigint NOT NULL,
    reference_number character varying(255),
    total_amount numeric(15,2) DEFAULT '0'::numeric NOT NULL,
    valid_until date,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    awarded_at timestamp(0) without time zone,
    purchase_order_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    currency character varying(255) DEFAULT 'IDR'::character varying NOT NULL,
    is_awarded boolean DEFAULT false NOT NULL,
    notes text,
    quote_date date
);


--
-- Name: vendor_quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_quotations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_quotations_id_seq OWNED BY public.vendor_quotations.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouses (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    address text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.warehouses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: workflow_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_audit_logs (
    id bigint NOT NULL,
    workflow_instance_id bigint NOT NULL,
    user_id bigint,
    action character varying(255) NOT NULL,
    from_status character varying(255),
    to_status character varying(255),
    metadata json,
    ip_address character varying(45),
    created_at timestamp(0) without time zone NOT NULL
);


--
-- Name: workflow_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_audit_logs_id_seq OWNED BY public.workflow_audit_logs.id;


--
-- Name: workflow_conditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_conditions (
    id bigint NOT NULL,
    workflow_step_id bigint NOT NULL,
    field_path character varying(255) NOT NULL,
    operator character varying(255) NOT NULL,
    value json NOT NULL,
    logical_operator character varying(255) DEFAULT 'and'::character varying NOT NULL,
    group_number integer DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT workflow_conditions_logical_operator_check CHECK (((logical_operator)::text = ANY ((ARRAY['and'::character varying, 'or'::character varying])::text[]))),
    CONSTRAINT workflow_conditions_operator_check CHECK (((operator)::text = ANY ((ARRAY['='::character varying, '!='::character varying, '>'::character varying, '<'::character varying, '>='::character varying, '<='::character varying, 'in'::character varying, 'not_in'::character varying, 'between'::character varying, 'contains'::character varying])::text[])))
);


--
-- Name: workflow_conditions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_conditions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_conditions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_conditions_id_seq OWNED BY public.workflow_conditions.id;


--
-- Name: workflow_delegations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_delegations (
    id bigint NOT NULL,
    delegator_user_id bigint NOT NULL,
    delegate_user_id bigint NOT NULL,
    workflow_id bigint,
    start_date date NOT NULL,
    end_date date,
    reason text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: workflow_delegations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_delegations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_delegations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_delegations_id_seq OWNED BY public.workflow_delegations.id;


--
-- Name: workflow_escalations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_escalations (
    id bigint NOT NULL,
    approval_task_id bigint NOT NULL,
    escalated_from_user_id bigint,
    escalated_to_user_id bigint NOT NULL,
    escalation_level integer DEFAULT 1 NOT NULL,
    reason text,
    created_at timestamp(0) without time zone NOT NULL
);


--
-- Name: workflow_escalations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_escalations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_escalations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_escalations_id_seq OWNED BY public.workflow_escalations.id;


--
-- Name: workflow_instances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_instances (
    id bigint NOT NULL,
    workflow_id bigint NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id bigint NOT NULL,
    current_step_id bigint,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    initiated_by bigint NOT NULL,
    initiated_at timestamp(0) without time zone NOT NULL,
    completed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT workflow_instances_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: workflow_instances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_instances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_instances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_instances_id_seq OWNED BY public.workflow_instances.id;


--
-- Name: workflow_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_notifications (
    id bigint NOT NULL,
    approval_task_id bigint NOT NULL,
    user_id bigint NOT NULL,
    type character varying(255) DEFAULT 'in_app'::character varying NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    sent_at timestamp(0) without time zone,
    error_message text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT workflow_notifications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT workflow_notifications_type_check CHECK (((type)::text = ANY ((ARRAY['email'::character varying, 'in_app'::character varying, 'sms'::character varying])::text[])))
);


--
-- Name: workflow_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_notifications_id_seq OWNED BY public.workflow_notifications.id;


--
-- Name: workflow_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_steps (
    id bigint NOT NULL,
    workflow_id bigint NOT NULL,
    step_number integer NOT NULL,
    name character varying(255) NOT NULL,
    step_type character varying(255) DEFAULT 'approval'::character varying NOT NULL,
    config json NOT NULL,
    sla_hours integer,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT workflow_steps_step_type_check CHECK (((step_type)::text = ANY ((ARRAY['approval'::character varying, 'notification'::character varying, 'conditional'::character varying, 'parallel'::character varying])::text[])))
);


--
-- Name: workflow_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflow_steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflow_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflow_steps_id_seq OWNED BY public.workflow_steps.id;


--
-- Name: workflows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflows (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    module character varying(255) NOT NULL,
    entity_type character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_by bigint NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: workflows_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workflows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workflows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workflows_id_seq OWNED BY public.workflows.id;


--
-- Name: approval_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests ALTER COLUMN id SET DEFAULT nextval('public.approval_requests_id_seq'::regclass);


--
-- Name: approval_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_rules ALTER COLUMN id SET DEFAULT nextval('public.approval_rules_id_seq'::regclass);


--
-- Name: approval_task_delegations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_task_delegations ALTER COLUMN id SET DEFAULT nextval('public.approval_task_delegations_id_seq'::regclass);


--
-- Name: approval_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_tasks ALTER COLUMN id SET DEFAULT nextval('public.approval_tasks_id_seq'::regclass);


--
-- Name: asset_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories ALTER COLUMN id SET DEFAULT nextval('public.asset_categories_id_seq'::regclass);


--
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- Name: blanket_order_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_order_lines ALTER COLUMN id SET DEFAULT nextval('public.blanket_order_lines_id_seq'::regclass);


--
-- Name: blanket_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_orders ALTER COLUMN id SET DEFAULT nextval('public.blanket_orders_id_seq'::regclass);


--
-- Name: budget_encumbrances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_encumbrances ALTER COLUMN id SET DEFAULT nextval('public.budget_encumbrances_id_seq'::regclass);


--
-- Name: budgets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets ALTER COLUMN id SET DEFAULT nextval('public.budgets_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: chart_of_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts ALTER COLUMN id SET DEFAULT nextval('public.chart_of_accounts_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: customer_invoice_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_invoice_lines ALTER COLUMN id SET DEFAULT nextval('public.customer_invoice_lines_id_seq'::regclass);


--
-- Name: customer_invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_invoices ALTER COLUMN id SET DEFAULT nextval('public.customer_invoices_id_seq'::regclass);


--
-- Name: customer_payment_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payment_lines ALTER COLUMN id SET DEFAULT nextval('public.customer_payment_lines_id_seq'::regclass);


--
-- Name: customer_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payments ALTER COLUMN id SET DEFAULT nextval('public.customer_payments_id_seq'::regclass);


--
-- Name: deals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals ALTER COLUMN id SET DEFAULT nextval('public.deals_id_seq'::regclass);


--
-- Name: delivery_order_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_order_lines ALTER COLUMN id SET DEFAULT nextval('public.delivery_order_lines_id_seq'::regclass);


--
-- Name: delivery_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_orders ALTER COLUMN id SET DEFAULT nextval('public.delivery_orders_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: depreciation_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depreciation_entries ALTER COLUMN id SET DEFAULT nextval('public.depreciation_entries_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: goods_receipt_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items ALTER COLUMN id SET DEFAULT nextval('public.goods_receipt_items_id_seq'::regclass);


--
-- Name: goods_receipts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts ALTER COLUMN id SET DEFAULT nextval('public.goods_receipts_id_seq'::regclass);


--
-- Name: inventory_count_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_count_lines ALTER COLUMN id SET DEFAULT nextval('public.inventory_count_lines_id_seq'::regclass);


--
-- Name: inventory_counts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_counts ALTER COLUMN id SET DEFAULT nextval('public.inventory_counts_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: journal_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries ALTER COLUMN id SET DEFAULT nextval('public.journal_entries_id_seq'::regclass);


--
-- Name: journal_entry_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines ALTER COLUMN id SET DEFAULT nextval('public.journal_entry_lines_id_seq'::regclass);


--
-- Name: landed_cost_allocations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_cost_allocations ALTER COLUMN id SET DEFAULT nextval('public.landed_cost_allocations_id_seq'::regclass);


--
-- Name: landed_costs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_costs ALTER COLUMN id SET DEFAULT nextval('public.landed_costs_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: payment_terms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_terms ALTER COLUMN id SET DEFAULT nextval('public.payment_terms_id_seq'::regclass);


--
-- Name: payroll_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs ALTER COLUMN id SET DEFAULT nextval('public.payroll_runs_id_seq'::regclass);


--
-- Name: payslips id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslips ALTER COLUMN id SET DEFAULT nextval('public.payslips_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: price_list_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_list_items ALTER COLUMN id SET DEFAULT nextval('public.price_list_items_id_seq'::regclass);


--
-- Name: price_lists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_lists ALTER COLUMN id SET DEFAULT nextval('public.price_lists_id_seq'::regclass);


--
-- Name: product_warehouse id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_warehouse ALTER COLUMN id SET DEFAULT nextval('public.product_warehouse_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_agreements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_agreements ALTER COLUMN id SET DEFAULT nextval('public.purchase_agreements_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_order_versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_versions ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_versions_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: purchase_request_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_request_items_id_seq'::regclass);


--
-- Name: purchase_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests ALTER COLUMN id SET DEFAULT nextval('public.purchase_requests_id_seq'::regclass);


--
-- Name: purchase_return_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_return_lines ALTER COLUMN id SET DEFAULT nextval('public.purchase_return_lines_id_seq'::regclass);


--
-- Name: purchase_returns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns ALTER COLUMN id SET DEFAULT nextval('public.purchase_returns_id_seq'::regclass);


--
-- Name: purchase_rfq_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_lines ALTER COLUMN id SET DEFAULT nextval('public.purchase_rfq_lines_id_seq'::regclass);


--
-- Name: purchase_rfq_vendors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_vendors ALTER COLUMN id SET DEFAULT nextval('public.purchase_rfq_vendors_id_seq'::regclass);


--
-- Name: purchase_rfqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfqs ALTER COLUMN id SET DEFAULT nextval('public.purchase_rfqs_id_seq'::regclass);


--
-- Name: qc_defect_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_defect_codes ALTER COLUMN id SET DEFAULT nextval('public.qc_defect_codes_id_seq'::regclass);


--
-- Name: qc_inspections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_inspections ALTER COLUMN id SET DEFAULT nextval('public.qc_inspections_id_seq'::regclass);


--
-- Name: rfq_vendors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_vendors ALTER COLUMN id SET DEFAULT nextval('public.rfq_vendors_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sales_order_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_order_lines ALTER COLUMN id SET DEFAULT nextval('public.sales_order_lines_id_seq'::regclass);


--
-- Name: sales_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders ALTER COLUMN id SET DEFAULT nextval('public.sales_orders_id_seq'::regclass);


--
-- Name: stock_moves id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves ALTER COLUMN id SET DEFAULT nextval('public.stock_moves_id_seq'::regclass);


--
-- Name: three_way_matches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.three_way_matches ALTER COLUMN id SET DEFAULT nextval('public.three_way_matches_id_seq'::regclass);


--
-- Name: uoms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uoms ALTER COLUMN id SET DEFAULT nextval('public.uoms_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendor_audits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_audits ALTER COLUMN id SET DEFAULT nextval('public.vendor_audits_id_seq'::regclass);


--
-- Name: vendor_bill_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bill_items ALTER COLUMN id SET DEFAULT nextval('public.vendor_bill_items_id_seq'::regclass);


--
-- Name: vendor_bills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bills ALTER COLUMN id SET DEFAULT nextval('public.vendor_bills_id_seq'::regclass);


--
-- Name: vendor_onboarding id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_onboarding ALTER COLUMN id SET DEFAULT nextval('public.vendor_onboarding_id_seq'::regclass);


--
-- Name: vendor_payment_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payment_lines ALTER COLUMN id SET DEFAULT nextval('public.vendor_payment_lines_id_seq'::regclass);


--
-- Name: vendor_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payments ALTER COLUMN id SET DEFAULT nextval('public.vendor_payments_id_seq'::regclass);


--
-- Name: vendor_performance_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_performance_logs ALTER COLUMN id SET DEFAULT nextval('public.vendor_performance_logs_id_seq'::regclass);


--
-- Name: vendor_pricelists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricelists ALTER COLUMN id SET DEFAULT nextval('public.vendor_pricelists_id_seq'::regclass);


--
-- Name: vendor_quotation_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotation_lines ALTER COLUMN id SET DEFAULT nextval('public.vendor_quotation_lines_id_seq'::regclass);


--
-- Name: vendor_quotations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotations ALTER COLUMN id SET DEFAULT nextval('public.vendor_quotations_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Name: workflow_audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_audit_logs ALTER COLUMN id SET DEFAULT nextval('public.workflow_audit_logs_id_seq'::regclass);


--
-- Name: workflow_conditions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_conditions ALTER COLUMN id SET DEFAULT nextval('public.workflow_conditions_id_seq'::regclass);


--
-- Name: workflow_delegations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_delegations ALTER COLUMN id SET DEFAULT nextval('public.workflow_delegations_id_seq'::regclass);


--
-- Name: workflow_escalations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_escalations ALTER COLUMN id SET DEFAULT nextval('public.workflow_escalations_id_seq'::regclass);


--
-- Name: workflow_instances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances ALTER COLUMN id SET DEFAULT nextval('public.workflow_instances_id_seq'::regclass);


--
-- Name: workflow_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_notifications ALTER COLUMN id SET DEFAULT nextval('public.workflow_notifications_id_seq'::regclass);


--
-- Name: workflow_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps ALTER COLUMN id SET DEFAULT nextval('public.workflow_steps_id_seq'::regclass);


--
-- Name: workflows id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflows ALTER COLUMN id SET DEFAULT nextval('public.workflows_id_seq'::regclass);


--
-- Name: approval_requests approval_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_pkey PRIMARY KEY (id);


--
-- Name: approval_rules approval_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_rules
    ADD CONSTRAINT approval_rules_pkey PRIMARY KEY (id);


--
-- Name: approval_task_delegations approval_task_delegations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_task_delegations
    ADD CONSTRAINT approval_task_delegations_pkey PRIMARY KEY (id);


--
-- Name: approval_tasks approval_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_tasks
    ADD CONSTRAINT approval_tasks_pkey PRIMARY KEY (id);


--
-- Name: asset_categories asset_categories_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_code_unique UNIQUE (code);


--
-- Name: asset_categories asset_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_pkey PRIMARY KEY (id);


--
-- Name: assets assets_asset_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_asset_number_unique UNIQUE (asset_number);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: blanket_order_lines blanket_order_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_order_lines
    ADD CONSTRAINT blanket_order_lines_pkey PRIMARY KEY (id);


--
-- Name: blanket_orders blanket_orders_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_orders
    ADD CONSTRAINT blanket_orders_number_unique UNIQUE (number);


--
-- Name: blanket_orders blanket_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_orders
    ADD CONSTRAINT blanket_orders_pkey PRIMARY KEY (id);


--
-- Name: budget_encumbrances budget_encumbrances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_encumbrances
    ADD CONSTRAINT budget_encumbrances_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_code_unique UNIQUE (code);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: customer_invoice_lines customer_invoice_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_invoice_lines
    ADD CONSTRAINT customer_invoice_lines_pkey PRIMARY KEY (id);


--
-- Name: customer_invoices customer_invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_invoices
    ADD CONSTRAINT customer_invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: customer_invoices customer_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_invoices
    ADD CONSTRAINT customer_invoices_pkey PRIMARY KEY (id);


--
-- Name: customer_payment_lines customer_payment_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payment_lines
    ADD CONSTRAINT customer_payment_lines_pkey PRIMARY KEY (id);


--
-- Name: customer_payments customer_payments_payment_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_payment_number_unique UNIQUE (payment_number);


--
-- Name: customer_payments customer_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: delivery_order_lines delivery_order_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_order_lines
    ADD CONSTRAINT delivery_order_lines_pkey PRIMARY KEY (id);


--
-- Name: delivery_orders delivery_orders_delivery_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_orders
    ADD CONSTRAINT delivery_orders_delivery_number_unique UNIQUE (delivery_number);


--
-- Name: delivery_orders delivery_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_orders
    ADD CONSTRAINT delivery_orders_pkey PRIMARY KEY (id);


--
-- Name: departments departments_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_unique UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: depreciation_entries depreciation_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depreciation_entries
    ADD CONSTRAINT depreciation_entries_pkey PRIMARY KEY (id);


--
-- Name: employees employees_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_unique UNIQUE (email);


--
-- Name: employees employees_employee_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_id_unique UNIQUE (employee_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: goods_receipt_items goods_receipt_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_pkey PRIMARY KEY (id);


--
-- Name: goods_receipts goods_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_pkey PRIMARY KEY (id);


--
-- Name: goods_receipts goods_receipts_receipt_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_receipt_number_unique UNIQUE (receipt_number);


--
-- Name: inventory_count_lines inventory_count_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_count_lines
    ADD CONSTRAINT inventory_count_lines_pkey PRIMARY KEY (id);


--
-- Name: inventory_counts inventory_counts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_counts
    ADD CONSTRAINT inventory_counts_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_entry_lines journal_entry_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id);


--
-- Name: landed_cost_allocations landed_cost_allocations_landed_cost_id_goods_receipt_item_id_un; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_cost_allocations
    ADD CONSTRAINT landed_cost_allocations_landed_cost_id_goods_receipt_item_id_un UNIQUE (landed_cost_id, goods_receipt_item_id);


--
-- Name: landed_cost_allocations landed_cost_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_cost_allocations
    ADD CONSTRAINT landed_cost_allocations_pkey PRIMARY KEY (id);


--
-- Name: landed_costs landed_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_costs
    ADD CONSTRAINT landed_costs_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: payment_terms payment_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_terms
    ADD CONSTRAINT payment_terms_pkey PRIMARY KEY (id);


--
-- Name: payroll_runs payroll_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);


--
-- Name: payslips payslips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: price_list_items price_list_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_pkey PRIMARY KEY (id);


--
-- Name: price_list_items price_list_items_price_list_id_product_id_min_quantity_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_price_list_id_product_id_min_quantity_unique UNIQUE (price_list_id, product_id, min_quantity);


--
-- Name: price_lists price_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_lists
    ADD CONSTRAINT price_lists_pkey PRIMARY KEY (id);


--
-- Name: product_warehouse product_warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_warehouse
    ADD CONSTRAINT product_warehouse_pkey PRIMARY KEY (id);


--
-- Name: product_warehouse product_warehouse_product_id_warehouse_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_warehouse
    ADD CONSTRAINT product_warehouse_product_id_warehouse_id_unique UNIQUE (product_id, warehouse_id);


--
-- Name: products products_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_code_unique UNIQUE (code);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_agreements purchase_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_agreements
    ADD CONSTRAINT purchase_agreements_pkey PRIMARY KEY (id);


--
-- Name: purchase_agreements purchase_agreements_reference_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_agreements
    ADD CONSTRAINT purchase_agreements_reference_number_unique UNIQUE (reference_number);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_versions purchase_order_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_versions
    ADD CONSTRAINT purchase_order_versions_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_versions purchase_order_versions_purchase_order_id_version_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_versions
    ADD CONSTRAINT purchase_order_versions_purchase_order_id_version_number_unique UNIQUE (purchase_order_id, version_number);


--
-- Name: purchase_orders purchase_orders_document_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_document_number_unique UNIQUE (document_number);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_request_items purchase_request_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items
    ADD CONSTRAINT purchase_request_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_requests purchase_requests_document_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_document_number_unique UNIQUE (document_number);


--
-- Name: purchase_requests purchase_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_pkey PRIMARY KEY (id);


--
-- Name: purchase_return_lines purchase_return_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_return_lines
    ADD CONSTRAINT purchase_return_lines_pkey PRIMARY KEY (id);


--
-- Name: purchase_returns purchase_returns_document_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_document_number_unique UNIQUE (document_number);


--
-- Name: purchase_returns purchase_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_pkey PRIMARY KEY (id);


--
-- Name: purchase_rfq_lines purchase_rfq_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_lines
    ADD CONSTRAINT purchase_rfq_lines_pkey PRIMARY KEY (id);


--
-- Name: purchase_rfq_vendors purchase_rfq_vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_vendors
    ADD CONSTRAINT purchase_rfq_vendors_pkey PRIMARY KEY (id);


--
-- Name: purchase_rfqs purchase_rfqs_document_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfqs
    ADD CONSTRAINT purchase_rfqs_document_number_unique UNIQUE (document_number);


--
-- Name: purchase_rfqs purchase_rfqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfqs
    ADD CONSTRAINT purchase_rfqs_pkey PRIMARY KEY (id);


--
-- Name: qc_defect_codes qc_defect_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_defect_codes
    ADD CONSTRAINT qc_defect_codes_code_unique UNIQUE (code);


--
-- Name: qc_defect_codes qc_defect_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_defect_codes
    ADD CONSTRAINT qc_defect_codes_pkey PRIMARY KEY (id);


--
-- Name: qc_inspections qc_inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_inspections
    ADD CONSTRAINT qc_inspections_pkey PRIMARY KEY (id);


--
-- Name: qc_inspections qc_inspections_reference_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_inspections
    ADD CONSTRAINT qc_inspections_reference_number_unique UNIQUE (reference_number);


--
-- Name: rfq_vendors rfq_vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_vendors
    ADD CONSTRAINT rfq_vendors_pkey PRIMARY KEY (id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sales_order_lines sales_order_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_order_lines
    ADD CONSTRAINT sales_order_lines_pkey PRIMARY KEY (id);


--
-- Name: sales_orders sales_orders_document_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_document_number_unique UNIQUE (document_number);


--
-- Name: sales_orders sales_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: stock_moves stock_moves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT stock_moves_pkey PRIMARY KEY (id);


--
-- Name: three_way_matches three_way_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.three_way_matches
    ADD CONSTRAINT three_way_matches_pkey PRIMARY KEY (id);


--
-- Name: uoms uoms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uoms
    ADD CONSTRAINT uoms_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendor_audits vendor_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_audits
    ADD CONSTRAINT vendor_audits_pkey PRIMARY KEY (id);


--
-- Name: vendor_bill_items vendor_bill_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bill_items
    ADD CONSTRAINT vendor_bill_items_pkey PRIMARY KEY (id);


--
-- Name: vendor_bills vendor_bills_bill_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bills
    ADD CONSTRAINT vendor_bills_bill_number_unique UNIQUE (bill_number);


--
-- Name: vendor_bills vendor_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bills
    ADD CONSTRAINT vendor_bills_pkey PRIMARY KEY (id);


--
-- Name: vendor_onboarding vendor_onboarding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_onboarding
    ADD CONSTRAINT vendor_onboarding_pkey PRIMARY KEY (id);


--
-- Name: vendor_payment_lines vendor_payment_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payment_lines
    ADD CONSTRAINT vendor_payment_lines_pkey PRIMARY KEY (id);


--
-- Name: vendor_payments vendor_payments_payment_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_payment_number_unique UNIQUE (payment_number);


--
-- Name: vendor_payments vendor_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_pkey PRIMARY KEY (id);


--
-- Name: vendor_performance_logs vendor_performance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_performance_logs
    ADD CONSTRAINT vendor_performance_logs_pkey PRIMARY KEY (id);


--
-- Name: vendor_pricelists vendor_pricelists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricelists
    ADD CONSTRAINT vendor_pricelists_pkey PRIMARY KEY (id);


--
-- Name: vendor_quotation_lines vendor_quotation_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotation_lines
    ADD CONSTRAINT vendor_quotation_lines_pkey PRIMARY KEY (id);


--
-- Name: vendor_quotations vendor_quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotations
    ADD CONSTRAINT vendor_quotations_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: workflow_audit_logs workflow_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_audit_logs
    ADD CONSTRAINT workflow_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: workflow_conditions workflow_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_conditions
    ADD CONSTRAINT workflow_conditions_pkey PRIMARY KEY (id);


--
-- Name: workflow_delegations workflow_delegations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_delegations
    ADD CONSTRAINT workflow_delegations_pkey PRIMARY KEY (id);


--
-- Name: workflow_escalations workflow_escalations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_escalations
    ADD CONSTRAINT workflow_escalations_pkey PRIMARY KEY (id);


--
-- Name: workflow_instances workflow_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_pkey PRIMARY KEY (id);


--
-- Name: workflow_notifications workflow_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_notifications
    ADD CONSTRAINT workflow_notifications_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_pkey PRIMARY KEY (id);


--
-- Name: workflow_steps workflow_steps_workflow_id_step_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_id_step_number_unique UNIQUE (workflow_id, step_number);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: approval_requests_approvable_type_approvable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_requests_approvable_type_approvable_id_index ON public.approval_requests USING btree (approvable_type, approvable_id);


--
-- Name: approval_requests_approvable_type_approvable_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_requests_approvable_type_approvable_id_status_index ON public.approval_requests USING btree (approvable_type, approvable_id, status);


--
-- Name: approval_requests_approver_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_requests_approver_id_status_index ON public.approval_requests USING btree (approver_id, status);


--
-- Name: approval_rules_entity_type_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_rules_entity_type_is_active_index ON public.approval_rules USING btree (entity_type, is_active);


--
-- Name: approval_rules_min_amount_max_amount_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_rules_min_amount_max_amount_index ON public.approval_rules USING btree (min_amount, max_amount);


--
-- Name: approval_tasks_assigned_to_role_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_tasks_assigned_to_role_id_index ON public.approval_tasks USING btree (assigned_to_role_id);


--
-- Name: approval_tasks_assigned_to_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_tasks_assigned_to_user_id_index ON public.approval_tasks USING btree (assigned_to_user_id);


--
-- Name: approval_tasks_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_tasks_status_index ON public.approval_tasks USING btree (status);


--
-- Name: approval_tasks_workflow_instance_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX approval_tasks_workflow_instance_id_status_index ON public.approval_tasks USING btree (workflow_instance_id, status);


--
-- Name: budget_encumbrances_encumberable_type_encumberable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_encumbrances_encumberable_type_encumberable_id_index ON public.budget_encumbrances USING btree (encumberable_type, encumberable_id);


--
-- Name: idx_po_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_created_at ON public.purchase_orders USING btree (created_at);


--
-- Name: idx_po_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_date ON public.purchase_orders USING btree (date);


--
-- Name: idx_po_status_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_status_date ON public.purchase_orders USING btree (status, date);


--
-- Name: idx_po_vendor_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_vendor_status ON public.purchase_orders USING btree (vendor_id, status);


--
-- Name: idx_po_warehouse; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_warehouse ON public.purchase_orders USING btree (warehouse_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: landed_costs_goods_receipt_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX landed_costs_goods_receipt_id_index ON public.landed_costs USING btree (goods_receipt_id);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: purchase_order_versions_purchase_order_id_version_number_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX purchase_order_versions_purchase_order_id_version_number_index ON public.purchase_order_versions USING btree (purchase_order_id, version_number);


--
-- Name: qc_inspections_inspectable_type_inspectable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX qc_inspections_inspectable_type_inspectable_id_index ON public.qc_inspections USING btree (inspectable_type, inspectable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: stock_moves_reference_type_reference_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_moves_reference_type_reference_id_index ON public.stock_moves USING btree (reference_type, reference_id);


--
-- Name: stock_moves_warehouse_id_product_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_moves_warehouse_id_product_id_index ON public.stock_moves USING btree (warehouse_id, product_id);


--
-- Name: three_way_matches_matched_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX three_way_matches_matched_at_index ON public.three_way_matches USING btree (matched_at);


--
-- Name: three_way_matches_status_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX three_way_matches_status_created_at_index ON public.three_way_matches USING btree (status, created_at);


--
-- Name: vendor_performance_logs_period_date_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_performance_logs_period_date_index ON public.vendor_performance_logs USING btree (period_date);


--
-- Name: vendor_performance_logs_reference_type_reference_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_performance_logs_reference_type_reference_id_index ON public.vendor_performance_logs USING btree (reference_type, reference_id);


--
-- Name: vendor_performance_logs_vendor_id_metric_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_performance_logs_vendor_id_metric_type_index ON public.vendor_performance_logs USING btree (vendor_id, metric_type);


--
-- Name: workflow_audit_logs_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_audit_logs_created_at_index ON public.workflow_audit_logs USING btree (created_at);


--
-- Name: workflow_audit_logs_user_id_action_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_audit_logs_user_id_action_index ON public.workflow_audit_logs USING btree (user_id, action);


--
-- Name: workflow_audit_logs_workflow_instance_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_audit_logs_workflow_instance_id_index ON public.workflow_audit_logs USING btree (workflow_instance_id);


--
-- Name: workflow_conditions_workflow_step_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_conditions_workflow_step_id_index ON public.workflow_conditions USING btree (workflow_step_id);


--
-- Name: workflow_delegations_delegate_user_id_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_delegations_delegate_user_id_is_active_index ON public.workflow_delegations USING btree (delegate_user_id, is_active);


--
-- Name: workflow_delegations_delegator_user_id_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_delegations_delegator_user_id_is_active_index ON public.workflow_delegations USING btree (delegator_user_id, is_active);


--
-- Name: workflow_delegations_workflow_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_delegations_workflow_id_index ON public.workflow_delegations USING btree (workflow_id);


--
-- Name: workflow_escalations_approval_task_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_escalations_approval_task_id_index ON public.workflow_escalations USING btree (approval_task_id);


--
-- Name: workflow_escalations_escalated_to_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_escalations_escalated_to_user_id_index ON public.workflow_escalations USING btree (escalated_to_user_id);


--
-- Name: workflow_instances_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_instances_entity_type_entity_id_index ON public.workflow_instances USING btree (entity_type, entity_id);


--
-- Name: workflow_instances_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_instances_status_index ON public.workflow_instances USING btree (status);


--
-- Name: workflow_instances_workflow_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_instances_workflow_id_index ON public.workflow_instances USING btree (workflow_id);


--
-- Name: workflow_notifications_approval_task_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_notifications_approval_task_id_index ON public.workflow_notifications USING btree (approval_task_id);


--
-- Name: workflow_notifications_user_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_notifications_user_id_status_index ON public.workflow_notifications USING btree (user_id, status);


--
-- Name: workflow_steps_workflow_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflow_steps_workflow_id_index ON public.workflow_steps USING btree (workflow_id);


--
-- Name: workflows_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflows_is_active_index ON public.workflows USING btree (is_active);


--
-- Name: workflows_module_entity_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX workflows_module_entity_type_index ON public.workflows USING btree (module, entity_type);


--
-- Name: approval_requests approval_requests_approval_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_approval_rule_id_foreign FOREIGN KEY (approval_rule_id) REFERENCES public.approval_rules(id) ON DELETE CASCADE;


--
-- Name: approval_requests approval_requests_approver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_requests
    ADD CONSTRAINT approval_requests_approver_id_foreign FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- Name: approval_rules approval_rules_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_rules
    ADD CONSTRAINT approval_rules_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: approval_rules approval_rules_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_rules
    ADD CONSTRAINT approval_rules_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: approval_task_delegations approval_task_delegations_approval_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_task_delegations
    ADD CONSTRAINT approval_task_delegations_approval_task_id_foreign FOREIGN KEY (approval_task_id) REFERENCES public.approval_tasks(id) ON DELETE CASCADE;


--
-- Name: approval_task_delegations approval_task_delegations_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_task_delegations
    ADD CONSTRAINT approval_task_delegations_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: approval_task_delegations approval_task_delegations_from_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_task_delegations
    ADD CONSTRAINT approval_task_delegations_from_user_id_foreign FOREIGN KEY (from_user_id) REFERENCES public.users(id);


--
-- Name: approval_task_delegations approval_task_delegations_to_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_task_delegations
    ADD CONSTRAINT approval_task_delegations_to_user_id_foreign FOREIGN KEY (to_user_id) REFERENCES public.users(id);


--
-- Name: approval_tasks approval_tasks_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_tasks
    ADD CONSTRAINT approval_tasks_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: approval_tasks approval_tasks_assigned_to_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_tasks
    ADD CONSTRAINT approval_tasks_assigned_to_role_id_foreign FOREIGN KEY (assigned_to_role_id) REFERENCES public.roles(id);


--
-- Name: approval_tasks approval_tasks_assigned_to_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_tasks
    ADD CONSTRAINT approval_tasks_assigned_to_user_id_foreign FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id);


--
-- Name: approval_tasks approval_tasks_workflow_instance_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_tasks
    ADD CONSTRAINT approval_tasks_workflow_instance_id_foreign FOREIGN KEY (workflow_instance_id) REFERENCES public.workflow_instances(id) ON DELETE CASCADE;


--
-- Name: approval_tasks approval_tasks_workflow_step_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_tasks
    ADD CONSTRAINT approval_tasks_workflow_step_id_foreign FOREIGN KEY (workflow_step_id) REFERENCES public.workflow_steps(id);


--
-- Name: asset_categories asset_categories_accumulated_depreciation_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_accumulated_depreciation_account_id_foreign FOREIGN KEY (accumulated_depreciation_account_id) REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT;


--
-- Name: asset_categories asset_categories_asset_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_asset_account_id_foreign FOREIGN KEY (asset_account_id) REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT;


--
-- Name: asset_categories asset_categories_depreciation_expense_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_depreciation_expense_account_id_foreign FOREIGN KEY (depreciation_expense_account_id) REFERENCES public.chart_of_accounts(id) ON DELETE RESTRICT;


--
-- Name: assets assets_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.asset_categories(id) ON DELETE RESTRICT;


--
-- Name: attendances attendances_employee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_employee_id_foreign FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: blanket_order_lines blanket_order_lines_blanket_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_order_lines
    ADD CONSTRAINT blanket_order_lines_blanket_order_id_foreign FOREIGN KEY (blanket_order_id) REFERENCES public.blanket_orders(id) ON DELETE CASCADE;


--
-- Name: blanket_order_lines blanket_order_lines_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_order_lines
    ADD CONSTRAINT blanket_order_lines_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: blanket_orders blanket_orders_purchase_agreement_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_orders
    ADD CONSTRAINT blanket_orders_purchase_agreement_id_foreign FOREIGN KEY (purchase_agreement_id) REFERENCES public.purchase_agreements(id) ON DELETE SET NULL;


--
-- Name: blanket_orders blanket_orders_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blanket_orders
    ADD CONSTRAINT blanket_orders_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id);


--
-- Name: budget_encumbrances budget_encumbrances_budget_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_encumbrances
    ADD CONSTRAINT budget_encumbrances_budget_id_foreign FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE CASCADE;


--
-- Name: budgets budgets_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_account_id_foreign FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL;


--
-- Name: budgets budgets_department_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_department_id_foreign FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: chart_of_accounts chart_of_accounts_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL;


--
-- Name: contacts contacts_payment_term_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_payment_term_id_foreign FOREIGN KEY (payment_term_id) REFERENCES public.payment_terms(id) ON DELETE SET NULL;


--
-- Name: customer_invoice_lines customer_invoice_lines_customer_invoice_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_invoice_lines
    ADD CONSTRAINT customer_invoice_lines_customer_invoice_id_foreign FOREIGN KEY (customer_invoice_id) REFERENCES public.customer_invoices(id) ON DELETE CASCADE;


--
-- Name: customer_invoice_lines customer_invoice_lines_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_invoice_lines
    ADD CONSTRAINT customer_invoice_lines_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: customer_invoices customer_invoices_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_invoices
    ADD CONSTRAINT customer_invoices_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.contacts(id);


--
-- Name: customer_payment_lines customer_payment_lines_customer_invoice_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payment_lines
    ADD CONSTRAINT customer_payment_lines_customer_invoice_id_foreign FOREIGN KEY (customer_invoice_id) REFERENCES public.customer_invoices(id);


--
-- Name: customer_payment_lines customer_payment_lines_customer_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payment_lines
    ADD CONSTRAINT customer_payment_lines_customer_payment_id_foreign FOREIGN KEY (customer_payment_id) REFERENCES public.customer_payments(id) ON DELETE CASCADE;


--
-- Name: customer_payments customer_payments_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.contacts(id);


--
-- Name: deals deals_contact_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_contact_id_foreign FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: deals deals_lead_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_lead_id_foreign FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: deals deals_owner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: delivery_order_lines delivery_order_lines_delivery_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_order_lines
    ADD CONSTRAINT delivery_order_lines_delivery_order_id_foreign FOREIGN KEY (delivery_order_id) REFERENCES public.delivery_orders(id) ON DELETE CASCADE;


--
-- Name: delivery_order_lines delivery_order_lines_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_order_lines
    ADD CONSTRAINT delivery_order_lines_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: delivery_orders delivery_orders_sales_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_orders
    ADD CONSTRAINT delivery_orders_sales_order_id_foreign FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id);


--
-- Name: delivery_orders delivery_orders_warehouse_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_orders
    ADD CONSTRAINT delivery_orders_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: departments departments_manager_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_manager_id_foreign FOREIGN KEY (manager_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: departments departments_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: depreciation_entries depreciation_entries_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depreciation_entries
    ADD CONSTRAINT depreciation_entries_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- Name: depreciation_entries depreciation_entries_gl_entry_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depreciation_entries
    ADD CONSTRAINT depreciation_entries_gl_entry_id_foreign FOREIGN KEY (gl_entry_id) REFERENCES public.journal_entries(id) ON DELETE RESTRICT;


--
-- Name: employees employees_department_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_foreign FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: employees employees_manager_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_manager_id_foreign FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: employees employees_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: goods_receipt_items goods_receipt_items_goods_receipt_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_goods_receipt_id_foreign FOREIGN KEY (goods_receipt_id) REFERENCES public.goods_receipts(id) ON DELETE CASCADE;


--
-- Name: goods_receipt_items goods_receipt_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: goods_receipt_items goods_receipt_items_qc_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_qc_by_foreign FOREIGN KEY (qc_by) REFERENCES public.users(id);


--
-- Name: goods_receipt_items goods_receipt_items_uom_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_uom_id_foreign FOREIGN KEY (uom_id) REFERENCES public.uoms(id);


--
-- Name: goods_receipts goods_receipts_cancelled_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_cancelled_by_foreign FOREIGN KEY (cancelled_by) REFERENCES public.users(id);


--
-- Name: goods_receipts goods_receipts_posted_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_posted_by_foreign FOREIGN KEY (posted_by) REFERENCES public.users(id);


--
-- Name: goods_receipts goods_receipts_purchase_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_purchase_order_id_foreign FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: goods_receipts goods_receipts_received_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_received_by_foreign FOREIGN KEY (received_by) REFERENCES public.users(id);


--
-- Name: goods_receipts goods_receipts_warehouse_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: inventory_count_lines inventory_count_lines_inventory_count_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_count_lines
    ADD CONSTRAINT inventory_count_lines_inventory_count_id_foreign FOREIGN KEY (inventory_count_id) REFERENCES public.inventory_counts(id) ON DELETE CASCADE;


--
-- Name: inventory_count_lines inventory_count_lines_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_count_lines
    ADD CONSTRAINT inventory_count_lines_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: inventory_counts inventory_counts_warehouse_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_counts
    ADD CONSTRAINT inventory_counts_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: journal_entry_lines journal_entry_lines_chart_of_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_chart_of_account_id_foreign FOREIGN KEY (chart_of_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: journal_entry_lines journal_entry_lines_journal_entry_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_journal_entry_id_foreign FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- Name: landed_cost_allocations landed_cost_allocations_goods_receipt_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_cost_allocations
    ADD CONSTRAINT landed_cost_allocations_goods_receipt_item_id_foreign FOREIGN KEY (goods_receipt_item_id) REFERENCES public.goods_receipt_items(id) ON DELETE CASCADE;


--
-- Name: landed_cost_allocations landed_cost_allocations_landed_cost_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_cost_allocations
    ADD CONSTRAINT landed_cost_allocations_landed_cost_id_foreign FOREIGN KEY (landed_cost_id) REFERENCES public.landed_costs(id) ON DELETE CASCADE;


--
-- Name: landed_costs landed_costs_expense_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_costs
    ADD CONSTRAINT landed_costs_expense_account_id_foreign FOREIGN KEY (expense_account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: landed_costs landed_costs_goods_receipt_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landed_costs
    ADD CONSTRAINT landed_costs_goods_receipt_id_foreign FOREIGN KEY (goods_receipt_id) REFERENCES public.goods_receipts(id) ON DELETE CASCADE;


--
-- Name: leads leads_owner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: leave_requests leave_requests_approver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_approver_id_foreign FOREIGN KEY (approver_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_employee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_employee_id_foreign FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: payslips payslips_employee_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_employee_id_foreign FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: payslips payslips_payroll_run_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_payroll_run_id_foreign FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_runs(id) ON DELETE CASCADE;


--
-- Name: price_list_items price_list_items_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_lists(id) ON DELETE CASCADE;


--
-- Name: price_list_items price_list_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price_list_items
    ADD CONSTRAINT price_list_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_warehouse product_warehouse_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_warehouse
    ADD CONSTRAINT product_warehouse_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_warehouse product_warehouse_warehouse_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_warehouse
    ADD CONSTRAINT product_warehouse_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;


--
-- Name: products products_uom_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_uom_id_foreign FOREIGN KEY (uom_id) REFERENCES public.uoms(id);


--
-- Name: purchase_agreements purchase_agreements_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_agreements
    ADD CONSTRAINT purchase_agreements_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id);


--
-- Name: purchase_order_items purchase_order_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_foreign FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_uom_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_uom_id_foreign FOREIGN KEY (uom_id) REFERENCES public.uoms(id);


--
-- Name: purchase_order_versions purchase_order_versions_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_versions
    ADD CONSTRAINT purchase_order_versions_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_order_versions purchase_order_versions_purchase_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_versions
    ADD CONSTRAINT purchase_order_versions_purchase_order_id_foreign FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_blanket_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_blanket_order_id_foreign FOREIGN KEY (blanket_order_id) REFERENCES public.blanket_orders(id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_payment_term_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_payment_term_id_foreign FOREIGN KEY (payment_term_id) REFERENCES public.payment_terms(id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_purchase_request_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_purchase_request_id_foreign FOREIGN KEY (purchase_request_id) REFERENCES public.purchase_requests(id) ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id);


--
-- Name: purchase_orders purchase_orders_warehouse_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: purchase_request_items purchase_request_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items
    ADD CONSTRAINT purchase_request_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_request_items purchase_request_items_purchase_request_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items
    ADD CONSTRAINT purchase_request_items_purchase_request_id_foreign FOREIGN KEY (purchase_request_id) REFERENCES public.purchase_requests(id) ON DELETE CASCADE;


--
-- Name: purchase_request_items purchase_request_items_uom_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_request_items
    ADD CONSTRAINT purchase_request_items_uom_id_foreign FOREIGN KEY (uom_id) REFERENCES public.uoms(id);


--
-- Name: purchase_requests purchase_requests_requester_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_requests
    ADD CONSTRAINT purchase_requests_requester_id_foreign FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: purchase_return_lines purchase_return_lines_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_return_lines
    ADD CONSTRAINT purchase_return_lines_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_return_lines purchase_return_lines_purchase_return_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_return_lines
    ADD CONSTRAINT purchase_return_lines_purchase_return_id_foreign FOREIGN KEY (purchase_return_id) REFERENCES public.purchase_returns(id) ON DELETE CASCADE;


--
-- Name: purchase_returns purchase_returns_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id);


--
-- Name: purchase_returns purchase_returns_warehouse_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_returns
    ADD CONSTRAINT purchase_returns_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: purchase_rfq_lines purchase_rfq_lines_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_lines
    ADD CONSTRAINT purchase_rfq_lines_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_rfq_lines purchase_rfq_lines_purchase_rfq_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_lines
    ADD CONSTRAINT purchase_rfq_lines_purchase_rfq_id_foreign FOREIGN KEY (purchase_rfq_id) REFERENCES public.purchase_rfqs(id) ON DELETE CASCADE;


--
-- Name: purchase_rfq_lines purchase_rfq_lines_uom_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_lines
    ADD CONSTRAINT purchase_rfq_lines_uom_id_foreign FOREIGN KEY (uom_id) REFERENCES public.uoms(id);


--
-- Name: purchase_rfq_vendors purchase_rfq_vendors_purchase_rfq_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_vendors
    ADD CONSTRAINT purchase_rfq_vendors_purchase_rfq_id_foreign FOREIGN KEY (purchase_rfq_id) REFERENCES public.purchase_rfqs(id) ON DELETE CASCADE;


--
-- Name: purchase_rfq_vendors purchase_rfq_vendors_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfq_vendors
    ADD CONSTRAINT purchase_rfq_vendors_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: purchase_rfqs purchase_rfqs_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfqs
    ADD CONSTRAINT purchase_rfqs_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_rfqs purchase_rfqs_purchase_request_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfqs
    ADD CONSTRAINT purchase_rfqs_purchase_request_id_foreign FOREIGN KEY (purchase_request_id) REFERENCES public.purchase_requests(id) ON DELETE SET NULL;


--
-- Name: purchase_rfqs purchase_rfqs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_rfqs
    ADD CONSTRAINT purchase_rfqs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: qc_inspections qc_inspections_inspector_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qc_inspections
    ADD CONSTRAINT qc_inspections_inspector_id_foreign FOREIGN KEY (inspector_id) REFERENCES public.users(id);


--
-- Name: rfq_vendors rfq_vendors_purchase_rfq_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_vendors
    ADD CONSTRAINT rfq_vendors_purchase_rfq_id_foreign FOREIGN KEY (purchase_rfq_id) REFERENCES public.purchase_rfqs(id) ON DELETE CASCADE;


--
-- Name: rfq_vendors rfq_vendors_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_vendors
    ADD CONSTRAINT rfq_vendors_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: sales_order_lines sales_order_lines_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_order_lines
    ADD CONSTRAINT sales_order_lines_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sales_order_lines sales_order_lines_sales_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_order_lines
    ADD CONSTRAINT sales_order_lines_sales_order_id_foreign FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON DELETE CASCADE;


--
-- Name: sales_orders sales_orders_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.contacts(id);


--
-- Name: sales_orders sales_orders_warehouse_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_moves stock_moves_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT stock_moves_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_moves stock_moves_warehouse_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_moves
    ADD CONSTRAINT stock_moves_warehouse_id_foreign FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: three_way_matches three_way_matches_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.three_way_matches
    ADD CONSTRAINT three_way_matches_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: three_way_matches three_way_matches_goods_receipt_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.three_way_matches
    ADD CONSTRAINT three_way_matches_goods_receipt_id_foreign FOREIGN KEY (goods_receipt_id) REFERENCES public.goods_receipts(id) ON DELETE SET NULL;


--
-- Name: three_way_matches three_way_matches_matched_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.three_way_matches
    ADD CONSTRAINT three_way_matches_matched_by_foreign FOREIGN KEY (matched_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: three_way_matches three_way_matches_purchase_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.three_way_matches
    ADD CONSTRAINT three_way_matches_purchase_order_id_foreign FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: three_way_matches three_way_matches_vendor_bill_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.three_way_matches
    ADD CONSTRAINT three_way_matches_vendor_bill_id_foreign FOREIGN KEY (vendor_bill_id) REFERENCES public.vendor_bills(id) ON DELETE SET NULL;


--
-- Name: users users_department_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_foreign FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: vendor_audits vendor_audits_auditor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_audits
    ADD CONSTRAINT vendor_audits_auditor_id_foreign FOREIGN KEY (auditor_id) REFERENCES public.users(id);


--
-- Name: vendor_audits vendor_audits_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_audits
    ADD CONSTRAINT vendor_audits_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: vendor_bill_items vendor_bill_items_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bill_items
    ADD CONSTRAINT vendor_bill_items_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: vendor_bill_items vendor_bill_items_vendor_bill_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bill_items
    ADD CONSTRAINT vendor_bill_items_vendor_bill_id_foreign FOREIGN KEY (vendor_bill_id) REFERENCES public.vendor_bills(id) ON DELETE CASCADE;


--
-- Name: vendor_bills vendor_bills_purchase_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bills
    ADD CONSTRAINT vendor_bills_purchase_order_id_foreign FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE SET NULL;


--
-- Name: vendor_bills vendor_bills_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_bills
    ADD CONSTRAINT vendor_bills_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: vendor_onboarding vendor_onboarding_reviewed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_onboarding
    ADD CONSTRAINT vendor_onboarding_reviewed_by_foreign FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: vendor_onboarding vendor_onboarding_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_onboarding
    ADD CONSTRAINT vendor_onboarding_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: vendor_payment_lines vendor_payment_lines_vendor_bill_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payment_lines
    ADD CONSTRAINT vendor_payment_lines_vendor_bill_id_foreign FOREIGN KEY (vendor_bill_id) REFERENCES public.vendor_bills(id);


--
-- Name: vendor_payment_lines vendor_payment_lines_vendor_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payment_lines
    ADD CONSTRAINT vendor_payment_lines_vendor_payment_id_foreign FOREIGN KEY (vendor_payment_id) REFERENCES public.vendor_payments(id) ON DELETE CASCADE;


--
-- Name: vendor_payments vendor_payments_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id);


--
-- Name: vendor_performance_logs vendor_performance_logs_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_performance_logs
    ADD CONSTRAINT vendor_performance_logs_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: vendor_pricelists vendor_pricelists_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricelists
    ADD CONSTRAINT vendor_pricelists_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: vendor_pricelists vendor_pricelists_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_pricelists
    ADD CONSTRAINT vendor_pricelists_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: vendor_quotation_lines vendor_quotation_lines_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotation_lines
    ADD CONSTRAINT vendor_quotation_lines_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: vendor_quotation_lines vendor_quotation_lines_vendor_quotation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotation_lines
    ADD CONSTRAINT vendor_quotation_lines_vendor_quotation_id_foreign FOREIGN KEY (vendor_quotation_id) REFERENCES public.vendor_quotations(id) ON DELETE CASCADE;


--
-- Name: vendor_quotations vendor_quotations_purchase_rfq_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotations
    ADD CONSTRAINT vendor_quotations_purchase_rfq_id_foreign FOREIGN KEY (purchase_rfq_id) REFERENCES public.purchase_rfqs(id) ON DELETE CASCADE;


--
-- Name: vendor_quotations vendor_quotations_vendor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_quotations
    ADD CONSTRAINT vendor_quotations_vendor_id_foreign FOREIGN KEY (vendor_id) REFERENCES public.contacts(id);


--
-- Name: workflow_audit_logs workflow_audit_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_audit_logs
    ADD CONSTRAINT workflow_audit_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: workflow_audit_logs workflow_audit_logs_workflow_instance_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_audit_logs
    ADD CONSTRAINT workflow_audit_logs_workflow_instance_id_foreign FOREIGN KEY (workflow_instance_id) REFERENCES public.workflow_instances(id) ON DELETE CASCADE;


--
-- Name: workflow_conditions workflow_conditions_workflow_step_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_conditions
    ADD CONSTRAINT workflow_conditions_workflow_step_id_foreign FOREIGN KEY (workflow_step_id) REFERENCES public.workflow_steps(id) ON DELETE CASCADE;


--
-- Name: workflow_delegations workflow_delegations_delegate_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_delegations
    ADD CONSTRAINT workflow_delegations_delegate_user_id_foreign FOREIGN KEY (delegate_user_id) REFERENCES public.users(id);


--
-- Name: workflow_delegations workflow_delegations_delegator_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_delegations
    ADD CONSTRAINT workflow_delegations_delegator_user_id_foreign FOREIGN KEY (delegator_user_id) REFERENCES public.users(id);


--
-- Name: workflow_delegations workflow_delegations_workflow_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_delegations
    ADD CONSTRAINT workflow_delegations_workflow_id_foreign FOREIGN KEY (workflow_id) REFERENCES public.workflows(id);


--
-- Name: workflow_escalations workflow_escalations_approval_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_escalations
    ADD CONSTRAINT workflow_escalations_approval_task_id_foreign FOREIGN KEY (approval_task_id) REFERENCES public.approval_tasks(id) ON DELETE CASCADE;


--
-- Name: workflow_escalations workflow_escalations_escalated_from_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_escalations
    ADD CONSTRAINT workflow_escalations_escalated_from_user_id_foreign FOREIGN KEY (escalated_from_user_id) REFERENCES public.users(id);


--
-- Name: workflow_escalations workflow_escalations_escalated_to_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_escalations
    ADD CONSTRAINT workflow_escalations_escalated_to_user_id_foreign FOREIGN KEY (escalated_to_user_id) REFERENCES public.users(id);


--
-- Name: workflow_instances workflow_instances_current_step_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_current_step_id_foreign FOREIGN KEY (current_step_id) REFERENCES public.workflow_steps(id);


--
-- Name: workflow_instances workflow_instances_initiated_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_initiated_by_foreign FOREIGN KEY (initiated_by) REFERENCES public.users(id);


--
-- Name: workflow_instances workflow_instances_workflow_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_instances
    ADD CONSTRAINT workflow_instances_workflow_id_foreign FOREIGN KEY (workflow_id) REFERENCES public.workflows(id);


--
-- Name: workflow_notifications workflow_notifications_approval_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_notifications
    ADD CONSTRAINT workflow_notifications_approval_task_id_foreign FOREIGN KEY (approval_task_id) REFERENCES public.approval_tasks(id) ON DELETE CASCADE;


--
-- Name: workflow_notifications workflow_notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_notifications
    ADD CONSTRAINT workflow_notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: workflow_steps workflow_steps_workflow_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_steps
    ADD CONSTRAINT workflow_steps_workflow_id_foreign FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: workflows workflows_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 6hA8w1TtChJNmYlZ3bL3ySVVt2dCc7wScMuBR6JXUCowxhNB5VaxUrVAQQOd05x

--
-- PostgreSQL database dump
--

\restrict AeqToDmOEfmQuFT4K8j8CImq9iWp1MXbOm1qDf1fs3BAm9Zb4Hicqwk80pBQumr

-- Dumped from database version 18.0 (Homebrew)
-- Dumped by pg_dump version 18.0 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_08_26_100418_add_two_factor_columns_to_users_table	1
5	2025_12_15_174811_create_permission_tables	1
6	2025_12_15_175233_create_personal_access_tokens_table	1
7	2025_12_15_180609_create_companies_table	1
8	2025_12_15_182636_create_products_table	1
9	2025_12_15_183056_create_contacts_table	1
10	2025_12_15_183303_create_uoms_table	1
11	2025_12_15_192343_create_purchase_orders_table	1
12	2025_12_15_192344_create_purchase_order_items_table	1
13	2025_12_15_193856_add_uom_id_to_products_table	1
14	2025_12_15_195328_add_cancellation_reason_to_purchase_orders_table	1
15	2025_12_15_200855_create_workflows_table	1
16	2025_12_15_200856_create_workflow_steps_table	1
17	2025_12_15_200857_create_workflow_instances_table	1
18	2025_12_15_200858_create_approval_tasks_table	1
19	2025_12_15_200859_create_workflow_delegations_table	1
20	2025_12_15_200907_create_workflow_escalations_table	1
21	2025_12_15_200908_create_workflow_notifications_table	1
22	2025_12_15_200909_create_workflow_audit_logs_table	1
23	2025_12_15_200910_create_workflow_conditions_table	1
24	2025_12_15_214420_create_approval_task_delegations_table	1
25	2025_12_16_004154_create_goods_receipts_table	1
26	2025_12_16_004331_create_product_warehouse_table	1
27	2025_12_16_015052_create_vendor_bills_table	1
28	2025_12_16_022200_add_tracking_columns_to_purchase_order_items_table	1
29	2025_12_16_032327_create_purchase_requests_table	1
30	2025_12_16_032328_create_purchase_request_items_table	1
31	2025_12_16_032828_add_purchase_request_id_to_purchase_orders_table	1
32	2025_12_16_103155_create_accounting_tables	1
33	2025_12_16_104249_create_vendor_payments_tables	1
34	2025_12_16_113438_create_purchase_returns_table	1
35	2025_12_17_043722_create_vendor_pricelists_table	1
36	2025_12_17_045300_create_purchase_rfqs_table	1
37	2025_12_17_045310_create_purchase_rfq_lines_table	1
38	2025_12_17_045320_create_vendor_quotations_table	1
39	2025_12_17_045330_create_vendor_quotation_lines_table	1
40	2025_12_17_065623_create_departments_table	2
41	2025_12_17_065624_create_budgets_table	2
42	2025_12_17_065625_create_budget_encumbrances_table	2
43	2025_12_17_070232_add_match_columns_to_vendor_bills_table	3
44	2025_12_17_072255_create_approval_rules_table	4
45	2025_12_17_072256_create_approval_requests_table	4
46	2025_12_17_072951_create_landed_costs_table	5
47	2025_12_17_072952_create_landed_cost_allocations_table	5
48	2025_12_17_073200_add_landed_cost_total_to_goods_receipt_items	6
49	2025_12_17_073310_add_qc_fields_to_goods_receipt_items	7
50	2025_12_17_073311_create_qc_inspections_table	7
51	2025_12_17_073534_add_scorecard_fields_to_contacts	8
52	2025_12_17_073535_create_vendor_performance_logs_table	8
53	2025_12_17_083343_update_rfq_tables_alignment	9
54	2025_12_17_083616_add_quote_date_to_vendor_quotations	10
55	2025_12_17_084539_create_rfq_vendors_table	11
56	2025_12_17_085415_add_department_id_to_users_table	11
57	2025_12_17_200806_create_payment_terms_table	12
58	2025_12_17_200807_add_payment_term_id_to_contacts_and_orders_tables	12
62	2025_12_17_211727_add_attachment_path_to_vendor_bills_table	13
63	2025_12_17_223052_add_tax_to_purchase_orders	13
64	2025_12_17_223054_add_tax_to_vendor_bills	13
65	2025_12_18_000000_seed_purchasing_coa	13
66	2025_12_17_224154_seed_tax_accounts	14
67	2025_12_17_235506_add_skipped_status_to_approval_tasks	15
68	2025_12_18_011331_update_chart_of_accounts_hierarchy	16
69	2025_12_18_014715_create_customer_invoices_table	17
70	2025_12_18_014715_create_customer_payments_table	17
71	2025_12_18_015000_create_customer_invoice_lines_table	17
72	2025_12_18_015000_create_customer_payment_lines_table	17
73	2025_12_18_015306_create_fixed_assets_tables	18
74	2025_12_18_022825_add_currency_columns_to_finance_tables	19
75	2025_12_18_055405_create_sales_orders_tables	20
76	2025_12_18_055518_create_stock_moves_table	21
77	2025_12_18_060037_create_delivery_orders_tables	22
78	2025_12_18_060157_create_inventory_counts_tables	23
79	2025_12_18_060806_create_customer_invoice_lines_table	24
80	2025_12_18_061205_create_leads_table	25
81	2025_12_18_061210_create_deals_table	25
82	2025_12_18_062102_create_price_lists_tables	26
83	2025_12_18_062819_create_employees_table	27
84	2025_12_18_063841_create_attendance_tables	28
85	2025_12_18_063841_create_payroll_tables	28
86	2025_12_18_071816_create_qc_defect_codes_table	29
87	2025_12_18_071907_update_qc_inspections_for_enterprise	30
88	2025_12_18_075516_create_vendor_onboarding_table	31
89	2025_12_18_075901_create_vendor_audits_table	32
90	2025_12_18_091400_add_vendor_enhancement_fields_to_contacts_table	33
91	2025_12_19_052501_add_purchase_request_id_to_purchase_rfqs_table	34
92	2025_12_19_162800_fix_purchase_order_status_values	35
93	2025_12_19_085110_add_indexes_to_purchase_orders_table	36
94	2025_12_20_033342_create_three_way_matches_table	36
95	2025_12_20_070911_add_source_to_purchase_orders_table	37
96	2025_12_20_075548_create_purchase_order_versions_table	38
97	2025_12_20_085306_create_purchase_agreements_table	39
98	2025_12_20_085307_create_blanket_orders_table	39
99	2025_12_20_085308_add_blanket_order_id_to_purchase_orders_table	39
100	2025_12_20_093243_add_renewal_fields_to_purchasing_tables	40
101	2025_12_21_060942_add_receive_fields_to_goods_receipts	41
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 101, true);


--
-- PostgreSQL database dump complete
--

\unrestrict AeqToDmOEfmQuFT4K8j8CImq9iWp1MXbOm1qDf1fs3BAm9Zb4Hicqwk80pBQumr

