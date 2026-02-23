import dynamic from 'next/dynamic';
import Head from 'next/head';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const DocsPage = () => {
  return (
    <>
      <Head>
        <title>API Docs</title>
      </Head>
      <main className='min-h-screen bg-[#020b21] p-4'>
        <div className='mx-auto max-w-6xl rounded-lg border border-white/10 bg-white p-2'>
          <SwaggerUI
            url='/api/docs'
            docExpansion='list'
            defaultModelsExpandDepth={1}
            displayRequestDuration
            deepLinking
          />
        </div>
      </main>
    </>
  );
};

export default DocsPage;
