import { FluentProvider } from "@fluentui/react-components";
import { claas2SaaSTheme } from "./styles/theme";
import { LoginPage } from "./components/LoginPage";

export default function App() {
  return (
    <FluentProvider theme={claas2SaaSTheme}>
      <LoginPage />
    </FluentProvider>
  );
}
