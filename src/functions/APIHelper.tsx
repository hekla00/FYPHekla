export const fetchThumbnailByISBN = async (isbn) => {
  console.log('fetchThumbnailByISBN called with ISBN: ', isbn);
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn+${encodeURIComponent(
      isbn
    )}`
  );
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    const book = data.items[0].volumeInfo;
    // console.log('Booki: ', book);
    return book.imageLinks?.thumbnail;
  } else {
    throw new Error('No book found with the provided ISBN');
  }
};

export const fetchThumbnailByTitle = async (title) => {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=intitle+${encodeURIComponent(
      title
    )}`
  );
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    const book = data.items[0].volumeInfo;
    // console.log('Bookt: ', book);
    return book.imageLinks?.thumbnail;
  } else {
    throw new Error('No book found with the provided title');
  }
};

export const fetchThumbnailByAuthor = async (author) => {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=inauthor+${encodeURIComponent(
      author
    )}`
  );
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    const book = data.items[0].volumeInfo;
    return book.imageLinks?.thumbnail;
  } else {
    throw new Error('No book found with the provided author');
  }
};
