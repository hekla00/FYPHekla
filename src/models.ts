// Place to keep all the models
// This is a simple model for a book
export interface Book {
  id: string;
  title: string;
  author: string;
}

export function toBook(doc): Book {
  // spread operator to spread the data from the doc object
  return { id: doc.id, ...doc.data() };
}
