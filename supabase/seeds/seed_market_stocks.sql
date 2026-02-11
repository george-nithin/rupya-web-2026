-- Seed Stocks for various NSE Sectors

-- 1. Financial Services (NIFTY BANK, NIFTY FIN SERVICE)
INSERT INTO market_equity_quotes (symbol, company_name, last_price, change, percent_change, pchange_1y, market_cap, pe_ratio, volume, sector, description) VALUES
('HDFCBANK', 'HDFC Bank Ltd', 1650.00, 12.50, 0.76, -5.2, 12500000000000, 18.5, 5000000, 'Financial Services', 'Leading private sector bank in India.'),
('ICICIBANK', 'ICICI Bank Ltd', 1050.00, 8.00, 0.77, 15.5, 7400000000000, 17.2, 4500000, 'Financial Services', 'Major private sector bank offering diverse financial services.'),
('SBIN', 'State Bank of India', 750.00, 5.00, 0.67, 30.2, 6700000000000, 9.8, 8000000, 'Financial Services', 'Largest public sector bank in India.'),
('AXISBANK', 'Axis Bank Ltd', 1100.00, -2.50, -0.23, 12.0, 3400000000000, 14.5, 3000000, 'Financial Services', 'Private sector bank providing retail and corporate banking services.'),
('KOTAKBANK', 'Kotak Mahindra Bank', 1800.00, 10.00, 0.56, -2.5, 3500000000000, 22.0, 2000000, 'Financial Services', 'Integrated financial services group.'),
('BAJFINANCE', 'Bajaj Finance Ltd', 7200.00, 150.00, 2.13, 8.5, 4300000000000, 35.0, 800000, 'Financial Services', 'Leading NBFC in India focusing on consumer lending.'),
('BAJAJFINSV', 'Bajaj Finserv Ltd', 1600.00, 20.00, 1.27, 5.0, 2500000000000, 30.0, 500000, 'Financial Services', 'Financial services holding company.'),
('HDFCLIFE', 'HDFC Life Insurance', 620.00, 3.00, 0.49, 1.5, 1300000000000, 85.0, 1500000, 'Financial Services', 'One of the leading life insurance companies.'),
('SBILIFE', 'SBI Life Insurance', 1450.00, -5.00, -0.34, 10.0, 1450000000000, 70.0, 600000, 'Financial Services', 'Joint venture life insurance company.'),
('INDUSINDBK', 'IndusInd Bank Ltd', 1500.00, 12.00, 0.81, 18.0, 1100000000000, 13.5, 2500000, 'Financial Services', 'New generation private sector bank.');

-- 2. Information Technology (NIFTY IT)
INSERT INTO market_equity_quotes (symbol, company_name, last_price, change, percent_change, pchange_1y, market_cap, pe_ratio, volume, sector, description) VALUES
('TCS', 'Tata Consultancy Services', 4000.00, 25.00, 0.63, 10.5, 14500000000000, 29.5, 1500000, 'Information Technology', 'Global leader in IT services, consulting, and business solutions.'),
('INFY', 'Infosys Ltd', 1650.00, -10.00, -0.60, 5.2, 6800000000000, 24.0, 4000000, 'Information Technology', 'Providing consulting, technology, outsourcing and next-generation services.'),
('HCLTECH', 'HCL Technologies', 1600.00, 15.00, 0.95, 35.0, 4300000000000, 22.5, 2000000, 'Information Technology', 'Global technology company helping enterprises reimagine their businesses.'),
('WIPRO', 'Wipro Ltd', 520.00, 2.00, 0.39, 8.0, 2700000000000, 20.0, 5000000, 'Information Technology', 'Global information technology, consulting and business process services company.'),
('LTIM', 'LTIMindtree Ltd', 5800.00, 50.00, 0.87, 12.0, 1700000000000, 32.0, 400000, 'Information Technology', 'Global technology consulting and digital solutions company.'),
('TECHM', 'Tech Mahindra Ltd', 1300.00, -8.00, -0.61, 15.0, 1200000000000, 25.0, 1200000, 'Information Technology', 'Represents the connected world, offering innovative and customer-centric IT experiences.'),
('PERSISTENT', 'Persistent Systems', 8200.00, 100.00, 1.23, 60.0, 600000000000, 45.0, 300000, 'Information Technology', 'Software development and technology services company.'),
('COFORGE', 'Coforge Ltd', 6200.00, 40.00, 0.65, 45.0, 400000000000, 38.0, 200000, 'Information Technology', 'Digital services and solutions provider.'),
('MPHASIS', 'Mphasis Ltd', 2600.00, 20.00, 0.77, 20.0, 490000000000, 28.0, 150000, 'Information Technology', 'Applying next-generation technology to help enterprises transform businesses.'),
('LTTS', 'L&T Technology Services', 5400.00, 25.00, 0.46, 25.0, 570000000000, 40.0, 100000, 'Information Technology', 'Focused on engineering and R&D (ER&D) services.');

-- 3. Automobile (NIFTY AUTO)
INSERT INTO market_equity_quotes (symbol, company_name, last_price, change, percent_change, pchange_1y, market_cap, pe_ratio, volume, sector, description) VALUES
('MARUTI', 'Maruti Suzuki India', 11500.00, 100.00, 0.88, 25.0, 3500000000000, 28.0, 300000, 'Automobile and Auto Components', 'Indias largest passenger car maker.'),
('TATAMOTORS', 'Tata Motors Ltd', 950.00, 10.00, 1.06, 80.0, 3100000000000, 18.0, 10000000, 'Automobile and Auto Components', 'Leading global automobile manufacturer.'),
('M&M', 'Mahindra & Mahindra', 1900.00, 15.00, 0.80, 40.0, 2300000000000, 20.0, 2500000, 'Automobile and Auto Components', 'Leader in utility vehicles and tractors.'),
('BAJAJ-AUTO', 'Bajaj Auto Ltd', 8500.00, 50.00, 0.59, 65.0, 2400000000000, 25.0, 200000, 'Automobile and Auto Components', 'Worlds most valuable two-wheeler company.'),
('EICHERMOT', 'Eicher Motors Ltd', 4000.00, -20.00, -0.50, 22.0, 1100000000000, 30.0, 350000, 'Automobile and Auto Components', 'Parent company of Royal Enfield.'),
('HEROMOTOCO', 'Hero MotoCorp Ltd', 4500.00, 30.00, 0.67, 55.0, 900000000000, 19.0, 400000, 'Automobile and Auto Components', 'Worlds largest manufacturer of two wheelers.'),
('TVSMOTOR', 'TVS Motor Company', 2100.00, 25.00, 1.20, 70.0, 1000000000000, 45.0, 800000, 'Automobile and Auto Components', 'Reputed two and three-wheeler manufacturer.'),
('BHARATFORG', 'Bharat Forge Ltd', 1200.00, 5.00, 0.42, 35.0, 560000000000, 40.0, 600000, 'Automobile and Auto Components', 'Indian multinational company involved in automotive components.'),
('ASHOKLEY', 'Ashok Leyland Ltd', 175.00, 1.50, 0.86, 15.0, 510000000000, 25.0, 8000000, 'Automobile and Auto Components', 'One of the leading commercial vehicle manufacturers.'),
('MRF', 'MRF Ltd', 145000.00, 500.00, 0.35, 30.0, 610000000000, 32.0, 5000, 'Automobile and Auto Components', 'Largest tyre manufacturer in India.');

-- 4. FMCG (NIFTY FMCG)
INSERT INTO market_equity_quotes (symbol, company_name, last_price, change, percent_change, pchange_1y, market_cap, pe_ratio, volume, sector, description) VALUES
('ITC', 'ITC Ltd', 450.00, -2.00, -0.44, 15.0, 5600000000000, 25.0, 8000000, 'Fast Moving Consumer Goods', 'Diversified conglomerate with stronger presence in FMCG.'),
('HINDUNILVR', 'Hindustan Unilever', 2400.00, 10.00, 0.42, -5.0, 5600000000000, 55.0, 1200000, 'Fast Moving Consumer Goods', 'Indias largest fast moving consumer goods company.'),
('NESTLEIND', 'Nestle India Ltd', 2500.00, 15.00, 0.60, 20.0, 2400000000000, 75.0, 200000, 'Fast Moving Consumer Goods', 'Subsidiary of Nestle, food and beverage company.'),
('BRITANNIA', 'Britannia Industries', 4900.00, 20.00, 0.41, 10.0, 1180000000000, 50.0, 150000, 'Fast Moving Consumer Goods', 'Specialized in bakery and dairy products.'),
('TITAN', 'Titan Company Ltd', 3600.00, 30.00, 0.84, 25.0, 3200000000000, 85.0, 800000, 'Fast Moving Consumer Goods', 'Mainly into Jewelry, Watches and Eyewear.'),
('TATACONSUM', 'Tata Consumer Products', 1150.00, 8.00, 0.70, 45.0, 1090000000000, 80.0, 1000000, 'Fast Moving Consumer Goods', 'Integrated Food & Beverage company.'),
('DABUR', 'Dabur India Ltd', 530.00, -1.00, -0.19, -2.0, 940000000000, 48.0, 1500000, 'Fast Moving Consumer Goods', 'Ayurvedic and Natural Health Care Company.'),
('GODREJCP', 'Godrej Consumer Products', 1250.00, 12.00, 0.97, 30.0, 1280000000000, 55.0, 600000, 'Fast Moving Consumer Goods', 'Leading emerging markets company.'),
('MARICO', 'Marico Ltd', 520.00, 3.00, 0.58, 5.0, 670000000000, 45.0, 1000000, 'Fast Moving Consumer Goods', 'Consumer products company operating in beauty and wellness.'),
('COLPAL', 'Colgate-Palmolive', 2600.00, 15.00, 0.58, 60.0, 700000000000, 52.0, 200000, 'Fast Moving Consumer Goods', 'Oral care products company.');

-- 5. Healthcare / Pharma (NIFTY PHARMA)
INSERT INTO market_equity_quotes (symbol, company_name, last_price, change, percent_change, pchange_1y, market_cap, pe_ratio, volume, sector, description) VALUES
('SUNPHARMA', 'Sun Pharmaceutical', 1550.00, 20.00, 1.31, 55.0, 3700000000000, 35.0, 2000000, 'Healthcare', 'Fourth largest specialty generic pharmaceutical company in the world.'),
('DRREDDY', 'Dr. Reddys Labs', 6200.00, 50.00, 0.81, 20.0, 1030000000000, 20.0, 300000, 'Healthcare', 'Integrated global pharmaceutical company.'),
('DIVISLAB', 'Divis Laboratories', 3800.00, -10.00, -0.26, 15.0, 1000000000000, 60.0, 250000, 'Healthcare', 'Leading manufacturer of APIs.'),
('CIPLA', 'Cipla Ltd', 1450.00, 12.00, 0.83, 40.0, 1170000000000, 28.0, 1500000, 'Healthcare', 'Global pharmaceutical company.'),
('APOLLOHOSP', 'Apollo Hospitals', 6400.00, 80.00, 1.27, 35.0, 920000000000, 95.0, 350000, 'Healthcare', 'Major hospital chain in India.'),
('LUPIN', 'Lupin Ltd', 1600.00, 15.00, 0.95, 80.0, 730000000000, 35.0, 1000000, 'Healthcare', 'Innovation led transnational pharmaceutical company.'),
('AUROPHARMA', 'Aurobindo Pharma', 1100.00, 10.00, 0.92, 90.0, 640000000000, 22.0, 1200000, 'Healthcare', 'Produces generic pharmaceuticals and active pharmaceutical ingredients.'),
('ALKEM', 'Alkem Laboratories', 5200.00, 40.00, 0.78, 45.0, 620000000000, 32.0, 50000, 'Healthcare', 'Leading Indian pharmaceutical company.'),
('TORNTPHARM', 'Torrent Pharma', 2600.00, 25.00, 0.97, 60.0, 880000000000, 55.0, 150000, 'Healthcare', 'Flagship company of the Torrent Group.'),
('BIOCON', 'Biocon Ltd', 280.00, 2.00, 0.72, 10.0, 330000000000, 40.0, 3000000, 'Healthcare', 'Biopharmaceutical company.');

ON CONFLICT (symbol) DO UPDATE 
SET 
  last_price = EXCLUDED.last_price,
  change = EXCLUDED.change,
  percent_change = EXCLUDED.percent_change,
  pchange_1y = EXCLUDED.pchange_1y,
  market_cap = EXCLUDED.market_cap,
  pe_ratio = EXCLUDED.pe_ratio,
  volume = EXCLUDED.volume,
  sector = EXCLUDED.sector,
  description = EXCLUDED.description;
