import { useAppContext } from "@/utils/AppContext";
import { ThemedText } from "@/components/ThemedText";

export default function Redirect() {
  const { isLoggedIn, user } = useAppContext();
  console.debug(`[Redirect] isLoggedIn: ${isLoggedIn}, user: ${user}`);
  return <ThemedText>Redirect</ThemedText>;
}
