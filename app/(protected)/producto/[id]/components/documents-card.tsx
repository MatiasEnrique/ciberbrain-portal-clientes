import { getDocumentosModelo } from "../data";

export default async function DocumentsCard({
  id,
  user_id,
}: {
  id: string;
  user_id: string;
}) {
  const documentos = await getDocumentosModelo(id);

  if (documentos.length === 0) {
    return null;
  }

  return <div>{JSON.stringify(documentos)}</div>;
}
