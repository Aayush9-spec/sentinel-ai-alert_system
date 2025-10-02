-- Create feedback table for customer sentiment monitoring
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('twitter', 'reviews', 'forum', 'email', 'chat')),
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score FLOAT CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  urgency TEXT CHECK (urgency IN ('HIGH', 'MEDIUM', 'LOW')),
  keywords TEXT[],
  suggested_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (public dashboard)
CREATE POLICY "Allow all operations on feedback" 
ON public.feedback 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for faster filtering
CREATE INDEX idx_feedback_urgency ON public.feedback(urgency);
CREATE INDEX idx_feedback_sentiment ON public.feedback(sentiment);
CREATE INDEX idx_feedback_source ON public.feedback(source);
CREATE INDEX idx_feedback_timestamp ON public.feedback(timestamp DESC);
CREATE INDEX idx_feedback_keywords ON public.feedback USING GIN(keywords);

-- Insert demo data (25 reviews with mix of sentiments)
INSERT INTO public.feedback (source, author, text, rating, timestamp, sentiment, sentiment_score, urgency, keywords, suggested_response) VALUES
-- HIGH urgency cases
('twitter', '@angry_customer', 'This is a complete SCAM! They took my money and never delivered. Reporting to authorities!', NULL, NOW() - INTERVAL '2 hours', 'negative', -0.95, 'HIGH', ARRAY['scam', 'fraud', 'refund'], 'We take these concerns seriously 🔒. Our security team has been notified and will investigate right away.'),
('reviews', 'Sarah Johnson', 'App keeps CRASHING every time I try to checkout. Lost my cart 3 times! This is ridiculous!', 1, NOW() - INTERVAL '1 hour', 'negative', -0.88, 'HIGH', ARRAY['crash', 'bug', 'checkout'], 'We''re sorry you faced this issue. Our team is actively working on a fix 🚀.'),
('forum', 'tech_user_99', 'Major BUG in the payment system. It charged me twice! Need immediate refund!', NULL, NOW() - INTERVAL '3 hours', 'negative', -0.92, 'HIGH', ARRAY['bug', 'refund', 'payment'], 'Apologies for the inconvenience. We''ve flagged your case and will update you soon regarding your refund 💳.'),
('reviews', 'Mike Chen', 'Where is my delivery?? It''s been 2 weeks! Customer service not responding!', 1, NOW() - INTERVAL '5 hours', 'negative', -0.85, 'HIGH', ARRAY['delivery', 'delay', 'support'], 'Sorry your order was delayed 😔. We''ll check immediately and get back to you.'),
('twitter', '@frustrated_dev', 'Your API is completely broken! Documentation is wrong and support ignores tickets. Moving to competitors.', NULL, NOW() - INTERVAL '4 hours', 'negative', -0.90, 'HIGH', ARRAY['bug', 'support', 'api'], 'We''re sorry you faced this issue. Our team is actively working on a fix 🚀.'),

-- MEDIUM urgency cases
('reviews', 'Jessica Williams', 'Not satisfied with the quality. Expected better for the price. Might return it.', 2, NOW() - INTERVAL '6 hours', 'negative', -0.45, 'MEDIUM', ARRAY['quality', 'price'], 'We''re truly sorry you had a poor experience 💔. Could you share more details so we can make it right?'),
('forum', 'casual_user', 'Interface is confusing. Took me forever to find basic settings. Needs improvement.', NULL, NOW() - INTERVAL '8 hours', 'negative', -0.35, 'MEDIUM', ARRAY['ui', 'usability'], 'We''re truly sorry you had a poor experience 💔. Could you share more details so we can make it right?'),
('reviews', 'David Martinez', 'Product is okay but shipping was slow. Also, packaging could be better.', 3, NOW() - INTERVAL '12 hours', 'neutral', -0.20, 'MEDIUM', ARRAY['delivery', 'packaging'], 'Sorry your order was delayed 😔. We''ll check immediately and get back to you.'),
('twitter', '@tech_reviewer', 'Been using for a week. Some features missing compared to competitors. Decent but not great.', NULL, NOW() - INTERVAL '1 day', 'neutral', -0.15, 'MEDIUM', ARRAY['features'], 'We''re truly sorry you had a poor experience 💔. Could you share more details so we can make it right?'),
('reviews', 'Amy Thompson', 'Customer service took 3 days to respond. Product is fine but support needs work.', 3, NOW() - INTERVAL '1 day', 'neutral', -0.25, 'MEDIUM', ARRAY['support'], 'We''re truly sorry you had a poor experience 💔. Could you share more details so we can make it right?'),

-- LOW urgency / Neutral
('reviews', 'Lisa Anderson', 'It works as described. Nothing special but gets the job done.', 3, NOW() - INTERVAL '2 days', 'neutral', 0.05, 'LOW', ARRAY[]::TEXT[], 'Thank you for your feedback! We''re always working to improve.'),
('forum', 'average_joe', 'Decent product. Some things I like, some things could be better. Overall neutral.', NULL, NOW() - INTERVAL '2 days', 'neutral', 0.00, 'LOW', ARRAY[]::TEXT[], 'Thank you for your feedback! We''re always working to improve.'),
('twitter', '@regular_user', 'Just bought this. Testing it out. Will update with thoughts later.', NULL, NOW() - INTERVAL '3 days', 'neutral', 0.10, 'LOW', ARRAY[]::TEXT[], 'Thank you for your feedback! We''re always working to improve.'),

-- POSITIVE cases
('reviews', 'Robert Taylor', 'Excellent product! Exceeded my expectations. Fast delivery too!', 5, NOW() - INTERVAL '1 hour', 'positive', 0.92, 'LOW', ARRAY['fast', 'quality'], 'Thank you so much! We''re thrilled you love it! 🎉'),
('twitter', '@happy_customer', 'Best purchase I made this year! Customer service was super helpful. Highly recommend! 😊', NULL, NOW() - INTERVAL '2 hours', 'positive', 0.95, 'LOW', ARRAY['support', 'recommend'], 'Thank you so much! We''re thrilled you love it! 🎉'),
('reviews', 'Emily Davis', 'Love it! Easy to use and works perfectly. Great value for money.', 5, NOW() - INTERVAL '3 hours', 'positive', 0.88, 'LOW', ARRAY['easy', 'value'], 'Thank you so much! We''re thrilled you love it! 🎉'),
('forum', 'power_user_2024', 'Been using for months. Rock solid performance. Support team is fantastic!', NULL, NOW() - INTERVAL '4 hours', 'positive', 0.85, 'LOW', ARRAY['performance', 'support'], 'Thank you so much! We''re thrilled you love it! 🎉'),
('reviews', 'James Wilson', 'Amazing! Solved all my problems. Can''t imagine going back to the old way.', 5, NOW() - INTERVAL '5 hours', 'positive', 0.90, 'LOW', ARRAY['solution'], 'Thank you so much! We''re thrilled you love it! 🎉'),
('twitter', '@tech_enthusiast', 'This is EXACTLY what I needed! Setup was super easy. Loving the features! 🚀', NULL, NOW() - INTERVAL '6 hours', 'positive', 0.93, 'LOW', ARRAY['features', 'easy'], 'Thank you so much! We''re thrilled you love it! 🎉'),
('reviews', 'Maria Garcia', 'Impressive quality and attention to detail. Customer service went above and beyond!', 5, NOW() - INTERVAL '7 hours', 'positive', 0.87, 'LOW', ARRAY['quality', 'support'], 'Thank you so much! We''re thrilled you love it! 🎉'),

-- More mixed reviews for variety
('reviews', 'Chris Brown', 'Good but has occasional glitches. Support helped me resolve them quickly.', 4, NOW() - INTERVAL '10 hours', 'positive', 0.65, 'LOW', ARRAY['support', 'bug'], 'Thank you for your feedback! We''re always working to improve.'),
('forum', 'newbie_user', 'Learning curve was steep but support documentation is helpful. Getting better at it.', NULL, NOW() - INTERVAL '15 hours', 'neutral', 0.30, 'LOW', ARRAY['documentation'], 'Thank you for your feedback! We''re always working to improve.'),
('reviews', 'Patricia Martinez', 'Fast shipping! Product quality is good. Interface could be more modern.', 4, NOW() - INTERVAL '18 hours', 'positive', 0.55, 'LOW', ARRAY['shipping', 'ui'], 'Thank you for your feedback! We''re always working to improve.'),
('twitter', '@business_owner', 'Using this for my team. Generally positive but pricing could be more competitive.', NULL, NOW() - INTERVAL '1 day', 'positive', 0.40, 'LOW', ARRAY['pricing'], 'Thank you for your feedback! We''re always working to improve.'),
('reviews', 'Kevin Lee', 'Solid product. Does what it promises. Customer service is responsive.', 4, NOW() - INTERVAL '1 day', 'positive', 0.70, 'LOW', ARRAY['support'], 'Thank you so much! We''re thrilled you love it! 🎉');