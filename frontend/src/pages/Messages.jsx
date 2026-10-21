import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import MessageCenter from '../components/MessageCenter';

export default function Messages({ user }) {
  const [params] = useSearchParams();
  return <div className="rp-page" style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 18px 50px' }}>
    <MessageCenter api={api} currentUserId={user?._id} initialConversationId={params.get('conversation') || ''} initialRecipientId={params.get('user') || ''} />
  </div>;
}

