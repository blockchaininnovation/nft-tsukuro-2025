import { Header } from "@/components/header";
import { NFTCard } from "@/components/nft-card";
import { WalletProvider } from "@/contexts/wallet-context";
import { NFT_METADATA } from "@/contracts/addresses";

interface HomeProps {
  searchParams: Promise<{ venue?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const isVenueMode = params.venue === "true";

  return (
    <WalletProvider isVenueMode={isVenueMode}>
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">NFTギャラリー</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isVenueMode
                ? "会場モード：アドレスを入力してミントしてください"
                : "お好きな作品を選んでミントしてください"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {NFT_METADATA.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                title={nft.title}
                description={nft.description}
                image={nft.image}
              />
            ))}
          </div>
        </main>
      </div>
    </WalletProvider>
  );
}
