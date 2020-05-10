import React from "react";
import firebase from "firebase";

export type WrappedComponentProps = {
  signInWithGoogle: () => void;
  signOut: () => void;
  user?: firebase.User | null;
  error?: string;
  loading: boolean;
};

export type FirebaseHOCState = {
  loading: boolean;
  user?: firebase.User | null;
  error?: string;
};

export default function withFireAuth<P extends object>(firebaseConfig: {}) {
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const provider = new firebase.auth.GoogleAuthProvider();
  const firebaseAppAuth = firebaseApp.auth();

  return (WrappedComponent: React.ComponentType<P & WrappedComponentProps>) => {
    return class FirebaseHOC extends React.PureComponent<P, FirebaseHOCState> {
      static displayName = `withFireAuth(${
        WrappedComponent.displayName || WrappedComponent.name
      })`;

      state: FirebaseHOCState = {
        loading: false,
        user: undefined,
        error: undefined,
      };

      componentDidMount() {
        firebaseAppAuth.onAuthStateChanged((user) => {
          if (user) {
            this.setState({ user });
          }
        });
      }

      signOut = async () => {
        try {
          this.setState({ loading: true });
          await firebaseAppAuth.signOut();
          this.setState({ user: null });
        } catch (error) {
          this.setState({ error });
          return error;
        } finally {
          this.setState({ loading: false });
        }
      };

      signInWithGoogle = async () => {
        try {
          this.setState({ loading: true });
          const result = await firebaseAppAuth.signInWithPopup(provider);
          const user = result.user;
          this.setState({ user });
        } catch (error) {
          this.setState({ error });
          const email = error.email;
          const credential = error.credential;

          if (error.code === "auth/account-exists-with-different-credential") {
            // When adding multiple providers this will handle existing account error
            // e.g. Sign in with FB email but Google Email Account already exists
            firebaseAppAuth
              .fetchSignInMethodsForEmail(email)
              .then(function (providers) {});
          }
        } finally {
          this.setState({ loading: false });
        }
      };

      render() {
        const props = {
          ...this.props,
          loading: this.state.loading,
          user: this.state.user,
          error: this.state.error,
        };

        return (
          <WrappedComponent
            {...props}
            signInWithGoogle={this.signInWithGoogle}
            signOut={this.signOut}
          />
        );
      }
    };
  };
}
