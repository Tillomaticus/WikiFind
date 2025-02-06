// App.tsx

import './App.css';
import WikiGame from './WikiGame'; 

function App() {
  return (
    <div className="App">
    <h1 className="text-3xl font-bold p-6">Wikipedia Navigation Game</h1>

    {/* wikiGame component */}
    <WikiGame />

    {/* Footer with custom text */}
    <footer className="mt-8 text-center">
      <p>by Tillomaticus</p>
    </footer>
  </div>
  );
}

export default App;
