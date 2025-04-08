import { View, Text, Button } from "react-native";

import { AppDispatch } from "../../store/globalStore";
import { useDispatch } from "react-redux";
import { resetFirstInstall } from "../../store/globalAction";

export default function Onboarding() {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <View>
      <Text>Onboarding</Text>
      <Text>Welcome to the app!</Text>
      <Text>Let's get started.</Text>
      <Button title="reset" onPress={() => dispatch(resetFirstInstall())} />
    </View>
  );
}
