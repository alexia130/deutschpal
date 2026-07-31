import { Navigate, createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import FavoritesPage from "../../pages/FavoritesPage";
import GrammarPage from "../../pages/GrammarPage";
import PracticePage from "../../pages/PracticePage";
import SettingsPage from "../../pages/SettingsPage";
import SpeakingPage from "../../pages/SpeakingPage";
import VocabularyPage from "../../pages/VocabularyPage";
import KnowledgeMapPage from "../../pages/KnowledgeMapPage";
import MistakesPage from "../../pages/MistakesPage";
import WordProfilePage from "../../pages/WordProfilePage";
import ContextPracticePage from "../../pages/ContextPracticePage";
import VerbTrainerPage from "../../pages/VerbTrainerPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Navigate
            to="/vocabulary"
            replace
          />
        ),
      },
      {
        path: "vocabulary",
        element: <VocabularyPage />,
      },
      {
        path: "vocabulary/:id",
        element: <WordProfilePage />,
      },
      {
        path: "practice",
        element: <PracticePage />,
      },
      {
        path: "speaking",
        element: <SpeakingPage />,
      },
      {
        path: "grammar",
        element: <GrammarPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "knowledge",
        element: <KnowledgeMapPage />,
      },
      {
        path: "mistakes",
        element: <MistakesPage />,
      },
      {
        path: "verbs",
        element: <VerbTrainerPage />,
      },
      {
        path: "context-practice",
        element: <ContextPracticePage />,
      },
      {
        path: "*",
        element: (
          <Navigate
            to="/vocabulary"
            replace
          />
        ),
      },
    ],
  },
]);