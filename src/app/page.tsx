import IngestionSources from './components/ingestion-sources';
import IngestedContent from './components/ingested-content';

export default function Home() {
  return (
    <div className='flex flex-col h-lvh '>
      <main className='flex flex-row space-x-4 w-full h-[90%]  p-2  justify-around'>
        <IngestionSources />
        <IngestedContent />
      </main>
      <footer className='row-start-3 flex gap-6 flex-wrap items-center justify-center'></footer>
    </div>
  );
}
