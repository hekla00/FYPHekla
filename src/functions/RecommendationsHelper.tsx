export const fetchBooks = async () => {
  const subjects = [
    'fiction',
    'history',
    'biography',
    'science',
    'self-help',
    'business',
    'literature',
    'mystery',
    'fantasy',
    'romance',
  ];
  let books = [];

  for (let subject of subjects) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&maxResults=5`
    );
    const data = await response.json();
    if (data.items) {
      const booksWithRating = data.items.filter(
        (book) => book.volumeInfo.averageRating >= 3
      );
      books = [...books, ...booksWithRating];
    }
    console.log('Books: ', books);
  }

  return books;
};
