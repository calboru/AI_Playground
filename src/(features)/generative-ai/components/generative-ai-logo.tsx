import React from 'react';

const GenerativeAILogo: React.FC = () => {
  return (
    <div className='flex items-center gap-2'>
      <svg
        className='w-12 h-12' // Larger for better visibility
        viewBox='0 0 64 64'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        {/* Brain (left, gradient-filled with 3D effect) */}
        <path
          d='M10 32c0-10 8-18 18-18s18 8 18 18-8 18-18 18-18-8-18-18'
          fill='url(#brainGradient)'
          stroke='white'
          strokeWidth='1'
        />
        {/* E (right, 3D with gradient and outline) */}
        <path
          d='M40 20h8v24h-8V20m4 28h-4v-4h4v4'
          fill='url(#eGradient)'
          stroke='white'
          strokeWidth='1'
        />
        {/* Connecting Arc (glowing wave, animated) */}
        <path
          d='M28 32q8 8 16 0'
          fill='none'
          stroke='url(#arcGradient)'
          strokeWidth='2'
          className='animate-pulse'
        />
        <defs>
          <linearGradient
            id='brainGradient'
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'
          >
            <stop offset='0%' style={{ stopColor: '#0EA5E9' }} />
            <stop offset='100%' style={{ stopColor: '#6366F1' }} />
          </linearGradient>
          <linearGradient id='eGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' style={{ stopColor: '#7DD3FC' }} />
            <stop offset='100%' style={{ stopColor: '#A5B4FC' }} />
          </linearGradient>
          <linearGradient id='arcGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop
              offset='0%'
              style={{ stopColor: '#22D3EE', stopOpacity: '0.7' }}
            />
            <stop
              offset='100%'
              style={{ stopColor: '#22D3EE', stopOpacity: '0' }}
            />
          </linearGradient>
        </defs>
      </svg>
      <span className='text-2xl font-bold text-white font-inter'>
        GenAI + ES
      </span>
      <span className='text-sm text-white opacity-70 ml-2'>
        Generative AI with Elasticsearch
      </span>
    </div>
  );
};

export default GenerativeAILogo;
