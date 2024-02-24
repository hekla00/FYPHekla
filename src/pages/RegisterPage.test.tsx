import { render, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './RegisterPage';
import { useAuth } from '../authentication';
import { auth, firestore } from '../firebase';

jest.mock('../authentication');
jest.mock('../firebase');

describe('RegisterPage', () => {
  beforeEach(() => {
    // Mock the useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      loggedIn: false,
    });

    // Mock the auth.createUserWithEmailAndPassword method
    (auth.createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: {
        uid: 'testUid',
        email: 'test@test.com',
      },
    });

    // Mock the firestore.collection.doc.set method
    (firestore.collection('users').doc().set as jest.Mock).mockResolvedValue(
      {}
    );
  });

  it('renders without crashing', () => {
    render(<RegisterPage />);
  });

  it('registers a user when the form is submitted', async () => {
    const { getByLabelText, getByText } = render(<RegisterPage />);

    fireEvent.change(getByLabelText('Email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'testPassword' },
    });

    fireEvent.click(getByText('Create an account'));

    await waitFor(() => {
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        'test@test.com',
        'testPassword'
      );
      expect(firestore.collection('users').doc().set).toHaveBeenCalledWith({
        email: 'test@test.com',
      });
    });
  });
});
