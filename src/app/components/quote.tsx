export default function Quote() {
  return (
    <div className='flex items-start space-x-2'>
      <span className='text-purple-700 text-4xl leading-none'>“</span>
      <p className='text-gray-800 text-lg leading-relaxed'>
        The microbiome – a collection population of commensal microbe living
        symbiotically with a multicellular organism.
        <span className='block mt-1'>(Turnbaugh et al, 2007)</span>
      </p>
    </div>
  );
}
