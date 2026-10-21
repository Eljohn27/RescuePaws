import React from 'react';
import { api } from '../api';
import MessageCenter from '../components/MessageCenter';

export default function AdminMessages({ adminUser, initialConversationId = '' }) {
  return <div className="adm-messages"><MessageCenter api={api} currentUserId={adminUser?._id} initialConversationId={initialConversationId} /></div>;
}

