// Place to keep all the models
// This is a simple model for a book
export interface Book {
  id: string;
  title: string;
  author: string;
  location: string;
  categories: string[];
  tags: string[];
  edition: string;
  isbn: string;
  pages: number;
  publisher: string;
  languages: string[];
  description: string;
  notes: string;
  purchaseDate: string;
  rating: number;
  releaseDate: string;
  reviews: string[];
  // thumbnailUrl: string;
}

export function toBook(doc): Book {
  // spread operator to spread the data from the doc object
  return { id: doc.id, ...doc.data() };
}
