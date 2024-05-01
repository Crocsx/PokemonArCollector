export type Collection = {
  sets: CollectionSet[];
};

export type CollectionSet = {
  title: string;
  cards: CollectionCard[];
};

export type CollectionCard = {
  name: string;
  image: string;
  link: string;
  collected: boolean;
};
