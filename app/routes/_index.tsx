import { type MetaFunction, type LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { fetchPortraitImageSource } from '~/utils/r2controll';

type FigureResponse = {
  id: number;
  lastName: string | null;
  firstName: string;
  courtesyName: string | null;
  lastNameKana: string | null;
  firstNameKana: string;
  courtesyNameKana: string | null;
  portrait: string | null;
};

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    {
      name: 'description',
      content: 'Welcome to Remix! Using Vite and Cloudflare!',
    },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { API_URL, BUCKET } = context.cloudflare.env;

  const response = await fetch(`${API_URL}/api/figures`);
  const data = (await response.json()) as { figures: FigureResponse[] };

  const figures = data.figures.map(async (figure) => {
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

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>作成中</h1>
      {figures.map((figure) => (
        <div key={figure.id}>
          <img src={figure.portrait.imageSrc ?? ''} />
        </div>
      ))}
    </div>
  );
}
