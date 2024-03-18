// Handler for title search
const handleTitleSearch = async (
  title,
  setTitle,
  setAuthor,
  setShowModal,
  setIsLoading,
  setData,
  setIsbnData,
  setBooks,
  setDescription,
  setPublisher,
  setPages,
  setReleaseDate,
  setCategory,
  setThumbnailUrl,
  setBookSelected,
  setLanguage,
  setShowToast,
  // setNotes,
  setPurchaseDate,
  // setRating,
  // setReview,
  setModalData
) => {
  console.log('title1: ', title);
  setShowModal(false);
  // Setting loading to true when the search starts
  setIsLoading(true);
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn+${encodeURIComponent(
      title
    )}`
  );
  const data = await response.json();

  // Setting loading to false when the search ends
  setIsLoading(false);
  setData(data);
  console.log('data: ', data);
  console.log('title: ', title);
  // check if author is found in the data and assign the author to the author state
  if (data?.titleData) {
    setIsbnData(data.title);
  }

  const books = data.items.map((item) => item.volumeInfo);
  console.log('books: ', books);
  setBooks(books);
  if (data.items.length === 1) {
    const book = data.items[0].volumeInfo;
    console.log('book: ', book);
    setTitle(book.title);
    setAuthor(book.authors.join(', '));
    setDescription(book.description);
    setPublisher(book.publisher);
    setPages(book.pageCount);
    setReleaseDate(book.publishedDate);
    setCategory((oldCategories) =>
      Array.from(
        new Set([
          ...oldCategories,
          ...(book.categories ? [book.categories] : []),
        ])
      )
    );
    setThumbnailUrl(book.imageLinks?.thumbnail);
    // setNotes(book.notes);
    setPurchaseDate(book.purchaseDate);
    // setRating(book.rating);
    // setReview(book.review);
    setShowModal(false);
    setBookSelected(true);
    setLanguage(book.language);
  } else if (data.items.length > 1) {
    // inject data into modal
    setModalData(data.items);
    // show model to select book
    setShowModal(true);
  } else {
    // If no book is found, show a message to the user
    // create a toast message to show the user that no book was found
    setShowToast(true);
  }
  return books;
};

export default handleTitleSearch;
