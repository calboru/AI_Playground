'use client';
import GenerativeAILogo from '@/(features)/generative-ai/components/generative-ai-logo';
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className='p-6 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white'>
      <GenerativeAILogo />
      <p className='text-sm opacity-80 mt-1'>
        Last updated: 2/18/2025, 4:36:03 PM
      </p>
    </div>
  );
};

export default Logo;
