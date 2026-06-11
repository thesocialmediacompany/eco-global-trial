import { CollectionForm } from "@/components/admin/CollectionForm";
import { createCollection } from "../actions";

export default function NewCollectionPage() {
  return <CollectionForm action={createCollection} />;
}
