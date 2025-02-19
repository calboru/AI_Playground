import ChatWithDatabase from '@/(features)/generative-ai/components/chat-with-database';
import InfiniteRAGDatabases from '@/(features)/generative-ai/components/infinite-RAG-databases';
import React from 'react';

const Chat = () => {
  return (
    <div className='flex flex-col h-lvh '>
      <main className='flex flex-row space-x-4 w-full h-[90%]  p-2  justify-around'>
        <InfiniteRAGDatabases />
        <ChatWithDatabase />
      </main>
      <footer className='row-start-3 flex gap-6 flex-wrap items-center justify-center'></footer>
    </div>
  );
};

export default Chat;
