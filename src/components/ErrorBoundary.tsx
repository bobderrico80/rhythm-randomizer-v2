import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="c-rr-app__error-container">
          <main className="c-rr-app__error">
            <h1>The Rhythm Randomizer</h1>
            <h2>Whoops! :-/</h2>
            <p>
              An unknown error occurred. Sorry about that! Try refreshing the
              page to see if it goes away.
            </p>

            <p>
              If not, leave a message on our{' '}
              <a
                href="https://www.facebook.com//TheRhythmRandomizer/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook Page
              </a>{' '}
              about the issue.
            </p>

            <p>
              You may also be using an unsupported browser. The Rhythm
              Randomizer works best on the most current versions of Chrome,
              Firefox, Safari, and Edge. Other browsers or older versions of
              those browsers may not work. Try using a different or newer
              browser to see if that resolves the issue.
            </p>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
