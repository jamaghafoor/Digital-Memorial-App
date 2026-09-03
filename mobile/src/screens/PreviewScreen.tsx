import React, { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api } from "../api/client";
import { MemorialHeadstone } from "../components/MemorialHeadstone";
import { Button, Screen } from "../components/ui";
import type { RootStackParams } from "../types";

export function MemorialPreviewScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, "Preview">) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    try {
      setBusy(true);
      await api.post("/memorials", route.params.draft);
      Alert.alert(t("submitted"));
      navigation.popTo("Main");
    } catch (error: any) {
      Alert.alert(t("submit"), error.response?.data?.message ?? error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen scroll>
      <MemorialHeadstone memorial={route.params.draft} />
      <Button
        title={busy ? t("submittingMemorial") : t("submit")}
        onPress={submit}
        loading={busy}
      />
    </Screen>
  );
}
