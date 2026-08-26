import { useState } from "react";
import { AuthScreen } from "@/components/auth-screen";
import { BookmarksPage } from "@/components/bookmarks-page";
import type { Usuario } from "@/types";

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  return usuario ? (
    <BookmarksPage usuario={usuario} onSair={() => setUsuario(null)} />
  ) : (
    <AuthScreen onEntrar={setUsuario} />
  );
}

export default App;
