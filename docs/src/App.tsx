import { useURLParams } from './hooks/useURLParams';
import { NFTCanvas } from './components/NFTCanvas';
import { ErrorDisplay } from './components/ErrorDisplay';

export default function App() {
  const params = useURLParams();

  if ('error' in params) {
    return <ErrorDisplay message={params.error} />;
  }

  return <NFTCanvas {...params} />;
}
