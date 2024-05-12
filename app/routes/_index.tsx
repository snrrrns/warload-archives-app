import { type LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { fetchPortraitImageSource } from '~/utils/r2controll';

type FigureNames = {
  lastName: string | null;
  firstName: string;
  lastNameKana: string | null;
  firstNameKana: string;
};

type FigureApiResponse = {
  id: number;
  portrait: string | null;
} & FigureNames;

type FigureWithImageSrc = {
  id: number;
  portrait: {
    filename: string | null;
    imageSrc: string | null;
  };
} & FigureNames;

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { API_URL, BUCKET } = context.cloudflare.env;

  const response = await fetch(`${API_URL}/api/figures`);
  const data = (await response.json()) as { figures: FigureApiResponse[] };

  const figures: Promise<FigureWithImageSrc>[] = await data.figures.map(async (figure) => {
    const { portrait, ...remain } = figure;

    return {
      ...remain,
      portrait: {
        filename: portrait,
        imageSrc: await fetchPortraitImageSource(BUCKET, portrait),
      },
    };
  });

  return json(await Promise.all(figures));
};

export default function Index() {
  const figures = useLoaderData<typeof loader>();

  const displayName = (figure: FigureWithImageSrc) => {
    const { lastName, firstName, lastNameKana, firstNameKana } = figure;
    return `${lastName ?? ''}${firstName}（${lastNameKana ?? ''}${firstNameKana}）`;
  };

  return (
    <>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center">三國志武将</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {figures.map((figure) => (
            <div
              key={figure.id}
              className="bg-white rounded-lg shadow-md cursor-pointer relative group"
            >
              {figure.portrait.imageSrc ? (
                <div className="h-44 overflow-hidden">
                  <img
                    src={figure.portrait.imageSrc}
                    alt={figure.portrait.filename ?? ''}
                    className="w-full opacity-80 group-hover:opacity-100 group-hover:scale-105 group-active:opacity-80 transition"
                  />
                </div>
              ) : (
                <div className="h-44 bg-[url('/app/images/placeholder.png')] bg-cover bg-center" />
              )}
              <div className="p-4">
                <h2 className="text-l">{displayName(figure)}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
