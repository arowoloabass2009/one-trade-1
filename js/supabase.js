// ============================================================
// ONE TRADE — Supabase Client & Data Services
// Project: uhxlogllucxqhereqsev.supabase.co  ✅ Connected
// Trade. Invest. Grow.
// ============================================================
'use strict';

const SUPABASE_URL = 'https://uhxlogllucxqhereqsev.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoeGxvZ2xsdWN4cWhlcmVxc2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDY3MjcsImV4cCI6MjA5OTI4MjcyN30.D-08PO5263E3vFmu2e-xeMd5DMDO5Oe_X2xaXTT7f14';

const _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'onetrade_uhxlogllucxqhereqsev'
  }
});

// ============================================================
// BLOG POSTS SERVICE
// ============================================================
const PostsService = {

  async getAll() {
    const { data, error } = await _sb
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPublished() {
    const { data, error } = await _sb
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await _sb
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(post) {
    const { data, error } = await _sb
      .from('blog_posts')
      .insert({
        title:     post.title,
        excerpt:   post.excerpt,
        content:   post.content,
        category:  post.category,
        emoji:     post.emoji     || '📊',
        author:    post.author,
        status:    post.status    || 'published',
        read_time: post.readTime  || 5,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await _sb
      .from('blog_posts')
      .update({
        title:      updates.title,
        excerpt:    updates.excerpt,
        content:    updates.content,
        category:   updates.category,
        emoji:      updates.emoji,
        author:     updates.author,
        status:     updates.status,
        read_time:  updates.read_time ?? updates.readTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await _sb
      .from('blog_posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getStats() {
    const { data, error } = await _sb
      .from('blog_posts')
      .select('id, status');
    if (error) throw error;
    const rows = data || [];
    return {
      total:     rows.length,
      published: rows.filter(r => r.status === 'published').length,
      drafts:    rows.filter(r => r.status === 'draft').length,
    };
  }
};

// ============================================================
// COMMENTS SERVICE
// ============================================================
const CommentsService = {

  async getByPost(postId) {
    const { data, error } = await _sb
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getAll() {
    const { data, error } = await _sb
      .from('post_comments')
      .select('*, blog_posts(title)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create({ postId, name, email, text }) {
    const { data, error } = await _sb
      .from('post_comments')
      .insert({
        post_id:      postId,
        author_name:  name,
        author_email: email || null,
        body:         text,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await _sb
      .from('post_comments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getCount() {
    const { count, error } = await _sb
      .from('post_comments')
      .select('id', { count: 'exact', head: true });
    if (error) return 0;
    return count || 0;
  },

  async getCountByPost(postId) {
    const { count, error } = await _sb
      .from('post_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);
    if (error) return 0;
    return count || 0;
  }
};

// ============================================================
// NEWSLETTER SERVICE
// ============================================================
const NewsletterService = {

  async subscribe(email) {
    const { error } = await _sb
      .from('newsletter_subscribers')
      .upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: 'email' });
    if (error) throw error;
  }
};

// ============================================================
// CONTACT SERVICE
// ============================================================
const ContactService = {

  async send({ name, email, phone, subject, message }) {
    const { error } = await _sb
      .from('contact_messages')
      .insert({ name, email, phone: phone || null, subject: subject || null, message });
    if (error) throw error;
  }
};

// ============================================================
// REALTIME — live comment subscription
// ============================================================
const RealtimeService = {
  _channels: [],

  subscribeToComments(postId, callback) {
    const ch = _sb
      .channel('post-comments-' + postId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_comments', filter: 'post_id=eq.' + postId },
        payload => callback(payload.new)
      )
      .subscribe();
    this._channels.push(ch);
    return ch;
  },

  unsubscribeAll() {
    this._channels.forEach(ch => _sb.removeChannel(ch));
    this._channels = [];
  }
};

// ============================================================
// CONNECTION TEST
// ============================================================
async function testConnection() {
  try {
    const { error } = await _sb.from('blog_posts').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('[OneTrade DB] Connection issue:', error.message);
    } else {
      console.log('%c [OneTrade DB] Supabase connected ✅ uhxlogllucxqhereqsev ', 'background:#071526;color:#00d4ff;font-weight:700;padding:4px 10px;border-radius:6px;');
    }
  } catch (e) {
    console.warn('[OneTrade DB] Could not reach Supabase:', e);
  }
}

testConnection();

// Expose globally
window.PostsService     = PostsService;
window.CommentsService  = CommentsService;
window.NewsletterService = NewsletterService;
window.ContactService   = ContactService;
window.RealtimeService  = RealtimeService;
window._sb              = _sb;
