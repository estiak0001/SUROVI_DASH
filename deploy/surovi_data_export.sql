--
-- PostgreSQL database dump
--

\restrict VbP9tQmU5iyGjgmLtbdL92MPxjL1I86Aq979LZ44P01IU2IPFx7R5ehApTRjPl9

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: dim_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dim_product (
    product_id integer NOT NULL,
    product_code character varying(50),
    product_name character varying(200) NOT NULL,
    product_category character varying(100),
    product_group character varying(100),
    brand character varying(100),
    unit_of_measure character varying(20),
    unit_price double precision,
    is_active smallint,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: dim_product_product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dim_product_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dim_product_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dim_product_product_id_seq OWNED BY public.dim_product.product_id;


--
-- Name: dim_region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dim_region (
    region_id integer NOT NULL,
    area_code character varying(10),
    area_name character varying(100) NOT NULL,
    division character varying(100),
    zone character varying(50),
    district character varying(100),
    region_type character varying(50),
    is_active smallint,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: dim_region_region_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dim_region_region_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dim_region_region_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dim_region_region_id_seq OWNED BY public.dim_region.region_id;


--
-- Name: dim_time; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dim_time (
    time_id integer NOT NULL,
    date date NOT NULL,
    day smallint,
    month smallint NOT NULL,
    month_name character varying(20) NOT NULL,
    month_short character varying(3) NOT NULL,
    quarter smallint NOT NULL,
    quarter_name character varying(10),
    year smallint NOT NULL,
    fiscal_year character varying(10),
    is_current_month smallint,
    is_current_year smallint
);


--
-- Name: dim_time_time_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dim_time_time_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dim_time_time_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dim_time_time_id_seq OWNED BY public.dim_time.time_id;


--
-- Name: fact_product_performance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fact_product_performance (
    fact_id integer NOT NULL,
    product_id integer NOT NULL,
    time_id integer NOT NULL,
    sales_value double precision,
    sales_volume double precision,
    prev_year_value double precision,
    prev_year_volume double precision,
    value_growth double precision,
    volume_growth double precision,
    value_growth_pct double precision,
    volume_growth_pct double precision,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: fact_product_performance_fact_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fact_product_performance_fact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fact_product_performance_fact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fact_product_performance_fact_id_seq OWNED BY public.fact_product_performance.fact_id;


--
-- Name: fact_sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fact_sales (
    fact_id integer NOT NULL,
    region_id integer NOT NULL,
    time_id integer NOT NULL,
    sales_target double precision,
    gross_sales double precision,
    sales_return double precision,
    net_sales double precision,
    sales_achievement_pct double precision,
    coll_target double precision,
    total_collection double precision,
    cash_collection double precision,
    credit_collection double precision,
    seed_collection double precision,
    coll_achievement_pct double precision,
    outstanding double precision,
    return_rate_pct double precision,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: fact_sales_fact_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fact_sales_fact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fact_sales_fact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fact_sales_fact_id_seq OWNED BY public.fact_sales.fact_id;


--
-- Name: dim_product product_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_product ALTER COLUMN product_id SET DEFAULT nextval('public.dim_product_product_id_seq'::regclass);


--
-- Name: dim_region region_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_region ALTER COLUMN region_id SET DEFAULT nextval('public.dim_region_region_id_seq'::regclass);


--
-- Name: dim_time time_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_time ALTER COLUMN time_id SET DEFAULT nextval('public.dim_time_time_id_seq'::regclass);


--
-- Name: fact_product_performance fact_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_product_performance ALTER COLUMN fact_id SET DEFAULT nextval('public.fact_product_performance_fact_id_seq'::regclass);


--
-- Name: fact_sales fact_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_sales ALTER COLUMN fact_id SET DEFAULT nextval('public.fact_sales_fact_id_seq'::regclass);


--
-- Data for Name: dim_product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dim_product (product_id, product_code, product_name, product_category, product_group, brand, unit_of_measure, unit_price, is_active, created_at, updated_at) FROM stdin;
1	\N	Agent	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
2	\N	Agrilux 	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
3	\N	Anitrozine	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
4	\N	Audi	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
5	\N	Averest	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
6	\N	Avision	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
7	\N	Chalcid	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
8	\N	Current	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
9	\N	Filtap	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
10	\N	Ipromar	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
11	\N	Iprotin	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
12	\N	Lido	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
13	\N	Moto	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
14	\N	Progress	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
15	\N	Ratol	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
16	\N	Rota	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
17	\N	Sinomethrin	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
18	\N	Aristodione	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
19	\N	Bactrol	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
20	\N	Bond	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
21	\N	Ciphur	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
22	\N	Dimension	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
23	\N	Dover	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
24	\N	Filthene	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
25	\N	Flash	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
26	\N	Safe Gourd	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
27	\N	Papa	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
28	\N	Shelter	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
29	\N	Sinozeb	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
30	\N	Suzim	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
31	\N	Velimax	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
32	\N	Heera Champion	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
33	\N	Heera Gold	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
34	\N	Heera Magic	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
35	\N	Heera Mix(Liquid)	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
36	\N	Heera Mix(Granular)	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
37	\N	Patabahar	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
38	\N	Rupali Bumper	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
39	\N	Sinoboron 500	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
40	\N	Sinoboric 100	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
41	\N	Sino Zinc (Hepta) 	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
42	\N	Sino Zinc (Mono) 	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
43	\N	Sinomag 25kg	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
44	\N	Sinogyp	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
45	\N	Fascinate	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
46	\N	Glyphosate	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
47	\N	Atron 	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
48	\N	Jajira 	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
49	\N	Kery	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
50	\N	Pentalin	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
51	\N	Prestige	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
52	\N	Sinate	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
53	\N	Sinoron	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
54	\N	Surah	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
55	\N	White Jewel-1	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
56	\N	Product Comparison Analysis without Product Bonus	General	\N	\N	\N	\N	1	2026-02-05 16:37:56.746236	2026-02-05 16:37:56.746236
\.


--
-- Data for Name: dim_region; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dim_region (region_id, area_code, area_name, division, zone, district, region_type, is_active, created_at, updated_at) FROM stdin;
1	A	Rangpur	Rangpur Division	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
2	B	Lalmonirhat	Rangpur Division	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
3	C	Thakurgaon	Rangpur Division	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
4	D	Nilphamari	Rangpur Division	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
5	A	Bogura	Greater Bogura	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
6	B	Sherpur	Greater Bogura	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
7	C	Dupcachia	Greater Bogura	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
8	D	Naogaon	Greater Bogura	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
9	E	Kushtia	Greater Bogura	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
10	A	Jhenaidah	Jhenaidah Division	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
11	B	Barishal	Jhenaidah Division	Central	\N	Area	1	2026-02-05 16:37:56.69879	2026-02-05 16:37:56.69879
\.


--
-- Data for Name: dim_time; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dim_time (time_id, date, day, month, month_name, month_short, quarter, quarter_name, year, fiscal_year, is_current_month, is_current_year) FROM stdin;
1	2023-01-01	1	1	January	Jan	1	Q1	2023	FY2022-23	0	0
2	2023-02-01	1	2	February	Feb	1	Q1	2023	FY2022-23	0	0
3	2023-03-01	1	3	March	Mar	1	Q1	2023	FY2022-23	0	0
4	2023-04-01	1	4	April	Apr	2	Q2	2023	FY2022-23	0	0
5	2023-05-01	1	5	May	May	2	Q2	2023	FY2022-23	0	0
6	2023-06-01	1	6	June	Jun	2	Q2	2023	FY2022-23	0	0
7	2023-07-01	1	7	July	Jul	3	Q3	2023	FY2023-24	0	0
8	2023-08-01	1	8	August	Aug	3	Q3	2023	FY2023-24	0	0
9	2023-09-01	1	9	September	Sep	3	Q3	2023	FY2023-24	0	0
10	2023-10-01	1	10	October	Oct	4	Q4	2023	FY2023-24	0	0
11	2023-11-01	1	11	November	Nov	4	Q4	2023	FY2023-24	0	0
12	2023-12-01	1	12	December	Dec	4	Q4	2023	FY2023-24	0	0
13	2024-01-01	1	1	January	Jan	1	Q1	2024	FY2023-24	0	0
14	2024-02-01	1	2	February	Feb	1	Q1	2024	FY2023-24	0	0
15	2024-03-01	1	3	March	Mar	1	Q1	2024	FY2023-24	0	0
16	2024-04-01	1	4	April	Apr	2	Q2	2024	FY2023-24	0	0
17	2024-05-01	1	5	May	May	2	Q2	2024	FY2023-24	0	0
18	2024-06-01	1	6	June	Jun	2	Q2	2024	FY2023-24	0	0
19	2024-07-01	1	7	July	Jul	3	Q3	2024	FY2024-25	0	0
20	2024-08-01	1	8	August	Aug	3	Q3	2024	FY2024-25	0	0
21	2024-09-01	1	9	September	Sep	3	Q3	2024	FY2024-25	0	0
22	2024-10-01	1	10	October	Oct	4	Q4	2024	FY2024-25	0	0
23	2024-11-01	1	11	November	Nov	4	Q4	2024	FY2024-25	0	0
24	2024-12-01	1	12	December	Dec	4	Q4	2024	FY2024-25	0	0
25	2025-01-01	1	1	January	Jan	1	Q1	2025	FY2024-25	0	0
26	2025-02-01	1	2	February	Feb	1	Q1	2025	FY2024-25	0	0
27	2025-03-01	1	3	March	Mar	1	Q1	2025	FY2024-25	0	0
28	2025-04-01	1	4	April	Apr	2	Q2	2025	FY2024-25	0	0
29	2025-05-01	1	5	May	May	2	Q2	2025	FY2024-25	0	0
30	2025-06-01	1	6	June	Jun	2	Q2	2025	FY2024-25	0	0
31	2025-07-01	1	7	July	Jul	3	Q3	2025	FY2025-26	0	0
32	2025-08-01	1	8	August	Aug	3	Q3	2025	FY2025-26	0	0
33	2025-09-01	1	9	September	Sep	3	Q3	2025	FY2025-26	0	0
34	2025-10-01	1	10	October	Oct	4	Q4	2025	FY2025-26	0	0
35	2025-11-01	1	11	November	Nov	4	Q4	2025	FY2025-26	0	0
36	2025-12-01	1	12	December	Dec	4	Q4	2025	FY2025-26	0	0
37	2026-01-01	1	1	January	Jan	1	Q1	2026	FY2025-26	0	1
38	2026-02-01	1	2	February	Feb	1	Q1	2026	FY2025-26	1	1
39	2026-03-01	1	3	March	Mar	1	Q1	2026	FY2025-26	0	1
40	2026-04-01	1	4	April	Apr	2	Q2	2026	FY2025-26	0	1
41	2026-05-01	1	5	May	May	2	Q2	2026	FY2025-26	0	1
42	2026-06-01	1	6	June	Jun	2	Q2	2026	FY2025-26	0	1
43	2026-07-01	1	7	July	Jul	3	Q3	2026	FY2026-27	0	1
44	2026-08-01	1	8	August	Aug	3	Q3	2026	FY2026-27	0	1
45	2026-09-01	1	9	September	Sep	3	Q3	2026	FY2026-27	0	1
46	2026-10-01	1	10	October	Oct	4	Q4	2026	FY2026-27	0	1
47	2026-11-01	1	11	November	Nov	4	Q4	2026	FY2026-27	0	1
48	2026-12-01	1	12	December	Dec	4	Q4	2026	FY2026-27	0	1
\.


--
-- Data for Name: fact_product_performance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fact_product_performance (fact_id, product_id, time_id, sales_value, sales_volume, prev_year_value, prev_year_volume, value_growth, volume_growth, value_growth_pct, volume_growth_pct, created_at, updated_at) FROM stdin;
1	1	23	28858604	23162.5	0	0	28858604	23162.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
2	1	35	34460316	27897	0	0	34460316	27897	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
3	2	23	873990	790.5	0	0	873990	790.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
4	2	35	63150	55.5	0	0	63150	55.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
5	3	23	19226140	3718.3	0	0	19226140	3718.3	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
6	3	35	17098733	3314.77	0	0	17098733	3314.77	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
7	4	23	3402184	1130.37	0	0	3402184	1130.37	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
8	4	35	3317760	1101.8	0	0	3317760	1101.8	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
9	5	23	1735752	1132.32	0	0	1735752	1132.32	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
10	5	35	2050620	1479.48	0	0	2050620	1479.48	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
11	6	23	2838112	326.28	0	0	2838112	326.28	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
12	6	35	1571392	185.12	0	0	1571392	185.12	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
13	7	23	620400	353.5	0	0	620400	353.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
14	7	35	817280	498.8	0	0	817280	498.8	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
15	8	23	2685000	718	0	0	2685000	718	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
16	8	35	5357500	1382	0	0	5357500	1382	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
17	9	23	1408505	645.1	0	0	1408505	645.1	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
18	9	35	96881	50.9	0	0	96881	50.9	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
19	10	23	7689990	3597.35	0	0	7689990	3597.35	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
20	10	35	13744140	6346.5	0	0	13744140	6346.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
21	11	23	5674800	6365.6	0	0	5674800	6365.6	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
22	11	35	5650080	6444	0	0	5650080	6444	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
23	12	23	4275363	4638.95	0	0	4275363	4638.95	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
24	12	35	3540830	3855	0	0	3540830	3855	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
25	13	23	2956320	946.76	0	0	2956320	946.76	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
26	13	35	43436440	14652.45	0	0	43436440	14652.45	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
27	14	23	4152411	1559.9999999999998	0	0	4152411	1559.9999999999998	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
28	14	35	1024544	395.2	0	0	1024544	395.2	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
29	15	23	900000	600	0	0	900000	600	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
30	15	35	234000	166	0	0	234000	166	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
31	16	23	7567910	10598.8	0	0	7567910	10598.8	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
32	16	35	7689516	10406.7	0	0	7689516	10406.7	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
33	17	23	1139526	1418.2	0	0	1139526	1418.2	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
34	17	35	806514	1032.6	0	0	806514	1032.6	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
35	18	23	3233045	1056.45	0	0	3233045	1056.45	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
36	18	35	2292500	727	0	0	2292500	727	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
37	19	23	10885841	11892.45	0	0	10885841	11892.45	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
38	19	35	6588535	7252.75	0	0	6588535	7252.75	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
39	20	23	0	0	0	0	0	0	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
40	20	35	108000	60	0	0	108000	60	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
41	21	23	18564450	116210	0	0	18564450	116210	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
42	21	35	26219300	158880	0	0	26219300	158880	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
43	22	23	16966310	2612.42	0	0	16966310	2612.42	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
44	22	35	17800410	2773.88	0	0	17800410	2773.88	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
45	23	23	28468034	10427.3	0	0	28468034	10427.3	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
46	23	35	25329138	9183.699999999999	0	0	25329138	9183.699999999999	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
47	24	23	7197206	10759.4	0	0	7197206	10759.4	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
48	24	35	15075094	20806.300000000003	0	0	15075094	20806.300000000003	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
49	25	23	1759000	2705.2	0	0	1759000	2705.2	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
50	25	35	532500	885	0	0	532500	885	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
51	26	23	0	0	0	0	0	0	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
52	26	35	9600	6	0	0	9600	6	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
53	27	23	3730970	3324.5	0	0	3730970	3324.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
54	27	35	3006610	2691.1	0	0	3006610	2691.1	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
55	28	23	4334400	1164	0	0	4334400	1164	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
56	28	35	3217500	871	0	0	3217500	871	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
57	29	23	6577255	10429	0	0	6577255	10429	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
58	29	35	2378000	3600	0	0	2378000	3600	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
59	30	23	3517320	3120.7	0	0	3517320	3120.7	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
60	30	35	5735618	5385	0	0	5735618	5385	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
61	31	23	1886300	865.6000000000001	0	0	1886300	865.6000000000001	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
62	31	35	829880	377.4	0	0	829880	377.4	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
63	32	23	0	0	0	0	0	0	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
64	32	35	129120	240	0	0	129120	240	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
65	33	23	2544504	4914	0	0	2544504	4914	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
66	33	35	777150	1453.5	0	0	777150	1453.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
67	34	23	1892040	309.29999999999995	0	0	1892040	309.29999999999995	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
68	34	35	1686380	295.5	0	0	1686380	295.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
69	35	23	56700	63	0	0	56700	63	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
70	35	35	126900	141	0	0	126900	141	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
71	36	23	138000	920	0	0	138000	920	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
72	36	35	7378500	49190	0	0	7378500	49190	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
73	37	23	4016000	2510	0	0	4016000	2510	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
74	37	35	1302400	814	0	0	1302400	814	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
75	38	23	3151687	4093.1	0	0	3151687	4093.1	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
76	38	35	2521610	2966.6	0	0	2521610	2966.6	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
77	39	23	3027600	11440	0	0	3027600	11440	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
78	39	35	2295000	6750	0	0	2295000	6750	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
79	40	23	1853000	1090	0	0	1853000	1090	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
80	40	35	183122	481.9	0	0	183122	481.9	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
81	41	23	1771400	11030	0	0	1771400	11030	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
82	41	35	1225600	7670	0	0	1225600	7670	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
83	42	23	2800800	11670	0	0	2800800	11670	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
84	42	35	9033600	37640	0	0	9033600	37640	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
85	43	23	0	0	0	0	0	0	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
86	43	35	5794250	105350	0	0	5794250	105350	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
87	44	23	2015290	105420	0	0	2015290	105420	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
88	44	35	1152500	57025	0	0	1152500	57025	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
89	45	23	573300	420	0	0	573300	420	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
90	45	35	817800	600	0	0	817800	600	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
91	46	23	2288500	5620	0	0	2288500	5620	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
92	46	35	448000	1280	0	0	448000	1280	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
93	47	23	8992080	8412	0	0	8992080	8412	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
94	47	35	6357270	5989.5	0	0	6357270	5989.5	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
95	48	23	1138680	1752	0	0	1138680	1752	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
96	48	35	1689996	2607.6	0	0	1689996	2607.6	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
97	49	23	2786320	870.725	0	0	2786320	870.725	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
98	49	35	4739200	1481	0	0	4739200	1481	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
99	50	23	5893955	6617.9	0	0	5893955	6617.9	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
100	50	35	7511624	8448.2	0	0	7511624	8448.2	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
101	51	23	3770800	17440	0	0	3770800	17440	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
102	51	35	6838200	31540	0	0	6838200	31540	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
103	52	23	0	0	0	0	0	0	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
104	52	35	628160	483.2	0	0	628160	483.2	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
105	53	23	336276	316	0	0	336276	316	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
106	53	35	433640	408	0	0	433640	408	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
107	54	23	6950580	18291	0	0	6950580	18291	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
108	54	35	17797000	48100	0	0	17797000	48100	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
109	55	23	8046400	17120	0	0	8046400	17120	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
110	55	35	5940800	12640	0	0	5940800	12640	0	0	2026-02-05 16:37:57.11186	2026-02-05 16:37:57.11186
\.


--
-- Data for Name: fact_sales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fact_sales (fact_id, region_id, time_id, sales_target, gross_sales, sales_return, net_sales, sales_achievement_pct, coll_target, total_collection, cash_collection, credit_collection, seed_collection, coll_achievement_pct, outstanding, return_rate_pct, created_at, updated_at) FROM stdin;
1	1	35	10220	7812	668	7144	69.9	5100	2086	80	1863	143	40.9	5058	8.55	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
2	2	35	8960	7007	192	6815	76.06	6200	3165	504	2066	595	51.05	3650	2.74	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
3	3	35	13720	9107	585	8522	62.11	9500	1522	236	1268	18	16.02	7000	6.42	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
4	4	35	3500	2245	250	1995	57	3200	1960	0	1777	183	61.25	35	11.14	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
5	5	35	6675	6075	0	6075	91.01	2100	1708	488	1220	NaN	81.33	4367	0	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
6	6	35	6450	2537	0	2537	39.33	3400	2178	391	1731	56	64.06	359	0	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
7	7	35	5700	2364	0	2364	41.47	3900	1466	715	751	NaN	37.59	898	0	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
8	8	35	7145	3774	0	3774	52.82	2300	1627	253	1374	NaN	70.74	2147	0	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
9	9	35	5625	4803	0	4803	85.39	2300	1904	515	1389	NaN	82.78	2899	0	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
10	10	35	7500	7997	963	7034	93.79	8000	3089	215	2149	725	38.61	3945	12.04	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
11	11	35	4300	4203	17	4186	97.35	5800	2325	135	1220	970	40.09	1861	0.4	2026-02-05 16:37:56.856518	2026-02-05 16:37:56.856518
\.


--
-- Name: dim_product_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dim_product_product_id_seq', 56, true);


--
-- Name: dim_region_region_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dim_region_region_id_seq', 11, true);


--
-- Name: dim_time_time_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dim_time_time_id_seq', 48, true);


--
-- Name: fact_product_performance_fact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fact_product_performance_fact_id_seq', 110, true);


--
-- Name: fact_sales_fact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fact_sales_fact_id_seq', 11, true);


--
-- Name: dim_product dim_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_product
    ADD CONSTRAINT dim_product_pkey PRIMARY KEY (product_id);


--
-- Name: dim_region dim_region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_region
    ADD CONSTRAINT dim_region_pkey PRIMARY KEY (region_id);


--
-- Name: dim_time dim_time_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_time
    ADD CONSTRAINT dim_time_date_key UNIQUE (date);


--
-- Name: dim_time dim_time_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_time
    ADD CONSTRAINT dim_time_pkey PRIMARY KEY (time_id);


--
-- Name: fact_product_performance fact_product_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_product_performance
    ADD CONSTRAINT fact_product_performance_pkey PRIMARY KEY (fact_id);


--
-- Name: fact_sales fact_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_sales
    ADD CONSTRAINT fact_sales_pkey PRIMARY KEY (fact_id);


--
-- Name: fact_product_performance uq_fact_product_time; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_product_performance
    ADD CONSTRAINT uq_fact_product_time UNIQUE (product_id, time_id);


--
-- Name: fact_sales uq_fact_sales_region_time; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_sales
    ADD CONSTRAINT uq_fact_sales_region_time UNIQUE (region_id, time_id);


--
-- Name: idx_dim_product_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_product_category ON public.dim_product USING btree (product_category);


--
-- Name: idx_dim_product_group; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_product_group ON public.dim_product USING btree (product_group);


--
-- Name: idx_dim_region_division; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_region_division ON public.dim_region USING btree (division);


--
-- Name: idx_dim_region_zone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_region_zone ON public.dim_region USING btree (zone);


--
-- Name: idx_dim_time_month_year; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dim_time_month_year ON public.dim_time USING btree (month, year);


--
-- Name: idx_fact_product_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fact_product_product ON public.fact_product_performance USING btree (product_id);


--
-- Name: idx_fact_product_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fact_product_time ON public.fact_product_performance USING btree (time_id);


--
-- Name: idx_fact_sales_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fact_sales_region ON public.fact_sales USING btree (region_id);


--
-- Name: idx_fact_sales_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fact_sales_time ON public.fact_sales USING btree (time_id);


--
-- Name: fact_product_performance fact_product_performance_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_product_performance
    ADD CONSTRAINT fact_product_performance_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.dim_product(product_id);


--
-- Name: fact_product_performance fact_product_performance_time_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_product_performance
    ADD CONSTRAINT fact_product_performance_time_id_fkey FOREIGN KEY (time_id) REFERENCES public.dim_time(time_id);


--
-- Name: fact_sales fact_sales_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_sales
    ADD CONSTRAINT fact_sales_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.dim_region(region_id);


--
-- Name: fact_sales fact_sales_time_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_sales
    ADD CONSTRAINT fact_sales_time_id_fkey FOREIGN KEY (time_id) REFERENCES public.dim_time(time_id);


--
-- PostgreSQL database dump complete
--

\unrestrict VbP9tQmU5iyGjgmLtbdL92MPxjL1I86Aq979LZ44P01IU2IPFx7R5ehApTRjPl9

