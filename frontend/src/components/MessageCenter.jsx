import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './MessageCenter.css';

const stamp = (value) => value ? new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

function Avatar({ user }) {
  return user?.avatar
    ? <img className="mc__avatar" src={user.avatar} alt="" />
    : <span className="mc__avatar mc__avatar--initial">{user?.name?.[0]?.toUpperCase() || '?'}</span>;
}

export default function MessageCenter({ api, currentUserId, initialConversationId = '', initialRecipientId = '' }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(initialConversationId);
  const [selectedUser, setSelectedUser] = useState(null);
  const [threadInfo, setThreadInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [admins, setAdmins] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const bottomRef = useRef(null);
  const handledRecipient = useRef('');

  const loadConversations = useCallback(async () => {
    try {
      const response = await api('/messages/conversations');
      setConversations(response.conversations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadConversations();
    const timer = window.setInterval(loadConversations, 10000);
    const onFocus = () => loadConversations();
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [loadConversations]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setResults([]); return undefined; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await api(`/messages/users?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        setResults(response.users || []);
      } catch (err) {
        if (err.name !== 'AbortError') setResults([]);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [api, query]);

  const openUser = useCallback(async (user) => {
    if (!user?.id || user.id === currentUserId) return;
    setError(''); setNotice('');
    try {
      const response = await api('/messages/conversations', { method: 'POST', body: { recipientId: user.id } });
      const conversation = response.conversation;
      setConversations((items) => [conversation, ...items.filter((item) => item.id !== conversation.id)]);
      setSelectedUser(conversation.otherUser || user);
      setSelectedId(conversation.id);
      setQuery(''); setResults([]); setAdmins(null);
    } catch (err) { setError(err.message); }
  }, [api, currentUserId]);

  useEffect(() => {
    if (!initialRecipientId || !currentUserId || handledRecipient.current === `${currentUserId}:${initialRecipientId}`) return;
    handledRecipient.current = `${currentUserId}:${initialRecipientId}`;
    api(`/users/${initialRecipientId}/public`).then((data) => openUser({ id: initialRecipientId, ...data.user })).catch((err) => setError(err.message));
  }, [api, currentUserId, initialRecipientId, openUser]);

  useEffect(() => {
    if (!selectedId) { setMessages([]); setThreadInfo(null); return undefined; }
    let active = true;
    const loadThread = async () => {
      try {
        const response = await api(`/messages/conversations/${selectedId}/messages`);
        if (!active) return;
        setMessages(response.messages || []);
        setThreadInfo(response.conversation);
        setSelectedUser(response.conversation?.otherUser || null);
        loadConversations();
        window.dispatchEvent(new Event('notifications:changed'));
      } catch (err) {
        if (active) setError(err.message);
      } finally { if (active) setThreadLoading(false); }
    };
    setThreadLoading(true); setError('');
    loadThread();
    const timer = window.setInterval(loadThread, 3500);
    return () => { active = false; window.clearInterval(timer); };
  }, [api, loadConversations, selectedId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectedConversation = useMemo(() => conversations.find((item) => item.id === selectedId), [conversations, selectedId]);
  const blockedByMe = threadInfo?.blockedByMe ?? selectedConversation?.blockedByMe ?? false;
  const blockedByOther = threadInfo?.blockedByOther ?? selectedConversation?.blockedByOther ?? false;

  const send = async (event) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || sending || !selectedId || blockedByMe || blockedByOther) return;
    setSending(true); setError('');
    try {
      await api(`/messages/conversations/${selectedId}/messages`, { method: 'POST', body: { text: body } });
      setText('');
      await loadConversations();
      const response = await api(`/messages/conversations/${selectedId}/messages`);
      setMessages(response.messages || []);
      setThreadInfo(response.conversation);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const toggleBlock = async () => {
    if (!selectedId) return;
    setError('');
    try {
      const response = await api(`/messages/conversations/${selectedId}/block`, { method: blockedByMe ? 'DELETE' : 'POST' });
      setThreadInfo((info) => ({ ...info, blockedByMe: response.blocked }));
      await loadConversations();
      setNotice(response.blocked ? 'This user is blocked. They cannot send messages in this conversation.' : 'This user can message you again.');
    } catch (err) { setError(err.message); }
  };

  const showAdmins = async () => {
    setError('');
    try { setAdmins((await api('/messages/admins')).users || []); }
    catch (err) { setError(err.message); }
  };

  const recipients = admins || results;

  return (
    <section className={`mc${selectedId ? ' mc--thread-open' : ''}`} aria-label="Direct messages">
      <aside className="mc__sidebar">
        <div className="mc__sidebar-head">
          <h1>Inbox</h1>
          <p>Private conversations with RescuePaws members.</p>
        </div>
        <label className="mc__search-label" htmlFor="mc-search">Find a member</label>
        <input id="mc-search" className="rp-input mc__search" value={query} maxLength={50} placeholder="Search by name" onChange={(event) => { setQuery(event.target.value); setAdmins(null); }} />
        <button type="button" className="rp-btn rp-btn--ghost rp-btn--sm mc__admin-link" onClick={showAdmins}>Contact an admin</button>
        {recipients.length > 0 && (
          <div className="mc__results" aria-label={admins ? 'Admins' : 'Members'}>
            {recipients.map((person) => <button type="button" key={person.id} className="mc__person" onClick={() => openUser(person)}><Avatar user={person} /><span><strong>{person.name}</strong>{person.isAdmin && <small>Admin</small>}</span></button>)}
          </div>
        )}
        {(query.trim().length >= 2 && results.length === 0 && !admins) && <p className="mc__muted">No members found.</p>}
        {admins && admins.length === 0 && <p className="mc__muted">No admin accounts are available.</p>}
        <h2 className="mc__list-label">Conversations</h2>
        {loading && <p className="mc__muted">Loading…</p>}
        {!loading && conversations.length === 0 && <p className="mc__muted">No conversations yet. Search for a member or contact an admin to start one.</p>}
        <div className="mc__conversations">
          {conversations.map((conversation) => (
            <button type="button" key={conversation.id} className={`mc__conversation${selectedId === conversation.id ? ' is-selected' : ''}`} onClick={() => { setSelectedId(conversation.id); setNotice(''); }}>
              <Avatar user={conversation.otherUser} />
              <span className="mc__conversation-copy"><strong>{conversation.otherUser?.name || 'Former member'}{conversation.otherUser?.isAdmin && <small className="mc__admin-tag">Admin</small>}</strong><span>{conversation.lastMessage || 'Start a conversation'}</span></span>
              {conversation.unreadCount > 0 && <span className="mc__unread">{conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}</span>}
            </button>
          ))}
        </div>
      </aside>

      <div className="mc__thread">
        {!selectedId ? (
          <div className="mc__empty"><span aria-hidden="true">✉</span><strong>Your messages</strong><p>Choose a conversation or find a member to message.</p></div>
        ) : (
          <>
            <header className="mc__thread-head">
              <button type="button" className="mc__back" onClick={() => setSelectedId('')}>Back</button>
              <Avatar user={selectedUser} />
              <div><strong>{selectedUser?.name || 'Conversation'}</strong>{selectedUser?.isAdmin && <span className="mc__admin-tag">Admin</span>}</div>
              <button type="button" className="rp-btn rp-btn--ghost rp-btn--sm mc__block" onClick={toggleBlock}>{blockedByMe ? 'Unblock' : 'Block'}</button>
            </header>
            {notice && <div className="mc__notice" role="status">{notice}</div>}
            <div className="mc__messages" aria-live="polite">
              {threadLoading && messages.length === 0 && <p className="mc__muted">Loading messages…</p>}
              {!threadLoading && messages.length === 0 && <p className="mc__muted mc__first-message">Say hello to start this conversation.</p>}
              {messages.map((message) => <div key={message.id} className={`mc__message${message.senderId === currentUserId ? ' is-mine' : ''}`}><p>{message.text}</p><time>{stamp(message.createdAt)}</time></div>)}
              <div ref={bottomRef} />
            </div>
            {blockedByMe || blockedByOther ? (
              <div className="mc__blocked" role="status">{blockedByMe ? 'You blocked this member.' : 'This member has blocked messaging.'}{blockedByMe && <button type="button" className="rp-link" onClick={toggleBlock}>Unblock</button>}</div>
            ) : (
              <form className="mc__composer" onSubmit={send}>
                <textarea className="rp-input" value={text} maxLength={2000} rows={2} placeholder="Write a message…" aria-label="Write a message" onChange={(event) => setText(event.target.value)} />
                <div className="mc__send-row"><span>{text.length}/2000</span><button type="submit" className="rp-btn rp-btn--primary" disabled={!text.trim() || sending}>{sending ? 'Sending…' : 'Send'}</button></div>
              </form>
            )}
          </>
        )}
      </div>
      {error && <div className="mc__error" role="alert">{error}<button type="button" aria-label="Dismiss" onClick={() => setError('')}>×</button></div>}
    </section>
  );
}
