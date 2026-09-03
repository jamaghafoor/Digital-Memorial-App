import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import type { MemorialDraft } from "../types";

type MemorialStyle =
  | "muslim"
  | "christian"
  | "catholic"
  | "orthodox"
  | "hindu"
  | "jewish"
  | "buddhist"
  | "sikh"
  | "neutral";

type HeadstoneConfig = {
  stone: string;
  stoneEdge: string;
  stoneShade: string;
  lettering: string;
  engraving: string;
  symbol: string | null;
  shape: "arched" | "classical" | "islamic" | "temple" | "rounded";
  frame: "plain" | "double" | "geometric";
  flower: string;
  flowerCenter: string;
};

const MEMORIAL_STYLES: Record<MemorialStyle, HeadstoneConfig> = {
  muslim: {
    stone: "#303b39",
    stoneEdge: "#71817b",
    stoneShade: "#17201f",
    lettering: "#eef1eb",
    engraving: "#aebbb5",
    symbol: "☾",
    shape: "islamic",
    frame: "geometric",
    flower: "#f1f0e9",
    flowerCenter: "#d4b970",
  },
  christian: {
    stone: "#3e4242",
    stoneEdge: "#858b88",
    stoneShade: "#202525",
    lettering: "#f1f0eb",
    engraving: "#bac0bd",
    symbol: "✝",
    shape: "arched",
    frame: "plain",
    flower: "#f2eee4",
    flowerCenter: "#d6bd76",
  },
  catholic: {
    stone: "#545250",
    stoneEdge: "#aaa59e",
    stoneShade: "#302f2e",
    lettering: "#f5f0e7",
    engraving: "#d1c8bb",
    symbol: "✝",
    shape: "classical",
    frame: "double",
    flower: "#efe8dc",
    flowerCenter: "#c8ad65",
  },
  orthodox: {
    stone: "#32363a",
    stoneEdge: "#747c82",
    stoneShade: "#171b1e",
    lettering: "#edf0f1",
    engraving: "#afb7bc",
    symbol: "☦",
    shape: "classical",
    frame: "double",
    flower: "#e8e5de",
    flowerCenter: "#bba66e",
  },
  hindu: {
    stone: "#8b7055",
    stoneEdge: "#c1a27d",
    stoneShade: "#55402f",
    lettering: "#fff4df",
    engraving: "#e3caa8",
    symbol: "ॐ",
    shape: "temple",
    frame: "geometric",
    flower: "#f0a451",
    flowerCenter: "#b74732",
  },
  jewish: {
    stone: "#666966",
    stoneEdge: "#aeb1aa",
    stoneShade: "#3b3e3b",
    lettering: "#f4f3ed",
    engraving: "#d0d2cc",
    symbol: "✡",
    shape: "rounded",
    frame: "plain",
    flower: "#e8e7df",
    flowerCenter: "#c8b36f",
  },
  buddhist: {
    stone: "#aaa18f",
    stoneEdge: "#d8d0c0",
    stoneShade: "#716959",
    lettering: "#302d28",
    engraving: "#5f594e",
    symbol: "❀",
    shape: "rounded",
    frame: "plain",
    flower: "#e9ded1",
    flowerCenter: "#b98772",
  },
  sikh: {
    stone: "#5c6062",
    stoneEdge: "#a1a7a8",
    stoneShade: "#303536",
    lettering: "#f3f2eb",
    engraving: "#ced1cc",
    symbol: "☬",
    shape: "arched",
    frame: "double",
    flower: "#eee9dc",
    flowerCenter: "#d3a85f",
  },
  neutral: {
    stone: "#464a49",
    stoneEdge: "#8d9390",
    stoneShade: "#252a29",
    lettering: "#f3f2ed",
    engraving: "#c3c8c4",
    symbol: null,
    shape: "arched",
    frame: "plain",
    flower: "#ece9e1",
    flowerCenter: "#c7a967",
  },
};

const textureMarks = [
  { left: "13%", top: "24%", size: 2 },
  { left: "78%", top: "18%", size: 3 },
  { left: "22%", top: "57%", size: 2 },
  { left: "84%", top: "64%", size: 2 },
  { left: "9%", top: "78%", size: 3 },
  { left: "68%", top: "84%", size: 2 },
] as const;

function resolveMemorialStyle(memorial: MemorialDraft): MemorialStyle {
  const religion = memorial.religion.trim().toLowerCase();
  if (/orthodox/.test(religion)) return "orthodox";
  if (/catholic/.test(religion)) return "catholic";
  if (/muslim|islam/.test(religion)) return "muslim";
  if (/jew|judaism/.test(religion)) return "jewish";
  if (/hindu/.test(religion)) return "hindu";
  if (/buddh/.test(religion)) return "buddhist";
  if (/sikh/.test(religion)) return "sikh";
  if (/christ/.test(religion)) return "christian";
  if (/neutral|non.?religious|secular|atheist|none/.test(religion))
    return "neutral";

  if (memorial.template === "islamic") return "muslim";
  if (memorial.template === "christian") return "christian";
  if (memorial.template === "buddhist") return "buddhist";
  return "neutral";
}

function Tree({ left, scale = 1 }: { left: `${number}%`; scale?: number }) {
  return (
    <View style={[s.tree, { left, transform: [{ scale }] }]}>
      <View style={s.treeCrownBack} />
      <View style={s.treeCrown} />
      <View style={s.treeTrunk} />
    </View>
  );
}

function DistantStone({
  left,
  height,
}: {
  left: `${number}%`;
  height: number;
}) {
  return (
    <View style={[s.distantStone, { left, height }]}>
      {" "}
      <View style={s.distantStoneTop} />
    </View>
  );
}

function Flowers({ color, center }: { color: string; center: string }) {
  const blooms = [
    { left: 5, top: 17, scale: 0.78 },
    { left: 36, top: 5, scale: 1 },
    { left: 70, top: 18, scale: 0.82 },
    { left: 100, top: 7, scale: 0.94 },
    { left: 130, top: 20, scale: 0.72 },
  ];
  return (
    <View pointerEvents="none" style={s.flowers}>
      <View style={[s.leaf, s.leafOne]} />
      <View style={[s.leaf, s.leafTwo]} />
      <View style={[s.leaf, s.leafThree]} />
      <View style={[s.leaf, s.leafFour]} />
      {blooms.map((bloom, index) => (
        <View
          key={index}
          style={[
            s.bloom,
            {
              left: bloom.left,
              top: bloom.top,
              transform: [{ scale: bloom.scale }],
            },
          ]}
        >
          <View style={[s.petal, s.petalTop, { backgroundColor: color }]} />
          <View style={[s.petal, s.petalRight, { backgroundColor: color }]} />
          <View style={[s.petal, s.petalBottom, { backgroundColor: color }]} />
          <View style={[s.petal, s.petalLeft, { backgroundColor: color }]} />
          <View style={[s.flowerCenter, { backgroundColor: center }]} />
        </View>
      ))}
    </View>
  );
}

export function MemorialHeadstone({ memorial }: { memorial: MemorialDraft }) {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(Math.max(screenWidth - 40, 280), 440);
  const sceneHeight = Math.round(width * 1.43);
  const stoneWidth = Math.round(width * 0.76);
  const stoneHeight = Math.round(sceneHeight * 0.69);
  const portraitWidth = Math.round(stoneWidth * 0.31);
  const styleKey = resolveMemorialStyle(memorial);
  const config = MEMORIAL_STYLES[styleKey];
  const isLightStone = styleKey === "buddhist";
  const shapeStyle = {
    arched: {
      borderTopLeftRadius: stoneWidth * 0.48,
      borderTopRightRadius: stoneWidth * 0.48,
    },
    classical: {
      borderTopLeftRadius: stoneWidth * 0.29,
      borderTopRightRadius: stoneWidth * 0.29,
    },
    islamic: {
      borderTopLeftRadius: stoneWidth * 0.42,
      borderTopRightRadius: stoneWidth * 0.42,
    },
    temple: {
      borderTopLeftRadius: stoneWidth * 0.14,
      borderTopRightRadius: stoneWidth * 0.14,
    },
    rounded: {
      borderTopLeftRadius: stoneWidth * 0.34,
      borderTopRightRadius: stoneWidth * 0.34,
    },
  }[config.shape];

  return (
    <View
      accessibilityLabel={`${t("inMemory")} ${memorial.fullName}`}
      style={[s.scene, { width, height: sceneHeight }]}
    >
      <View style={s.sky} />
      <View style={s.sunGlow} />
      <View style={[s.cloud, s.cloudOne]} />
      <View style={[s.cloud, s.cloudTwo]} />
      <View style={s.horizon} />
      <Tree left="-5%" scale={1.1} />
      <Tree left="80%" scale={0.86} />
      <DistantStone left="9%" height={51} />
      <DistantStone left="76%" height={43} />
      <View style={s.grassFar} />
      <View style={s.grassNear} />
      <View style={[s.groundShadow, { width: stoneWidth * 1.12 }]} />

      <View
        style={[
          s.stoneAssembly,
          { width: stoneWidth, height: stoneHeight + 35 },
        ]}
      >
        <View
          style={[
            s.stoneDepth,
            shapeStyle,
            { backgroundColor: config.stoneShade },
          ]}
        />
        <View
          style={[
            s.stone,
            shapeStyle,
            { backgroundColor: config.stone, borderColor: config.stoneEdge },
          ]}
        >
          <View style={[s.stoneHighlight, shapeStyle]} />
          <View style={s.stoneSideShade} />
          {textureMarks.map((mark, index) => (
            <View
              key={index}
              style={[
                s.textureMark,
                {
                  left: mark.left,
                  top: mark.top,
                  width: mark.size,
                  height: mark.size,
                  backgroundColor: config.stoneEdge,
                },
              ]}
            />
          ))}
          <View style={[s.stoneVein, { borderColor: config.stoneEdge }]} />
          {config.frame !== "plain" && (
            <View
              style={[
                s.innerFrame,
                shapeStyle,
                { borderColor: config.engraving },
                config.frame === "geometric" && s.geometricFrame,
              ]}
            />
          )}

          <View style={s.inscription}>
            {config.symbol && (
              <Text style={[s.symbol, { color: config.engraving }]}>
                {config.symbol}
              </Text>
            )}
            <View
              style={[
                s.portraitFrame,
                {
                  width: portraitWidth + 10,
                  height: portraitWidth * 1.12 + 10,
                  borderColor: config.stoneEdge,
                  backgroundColor: config.stoneShade,
                },
              ]}
            >
              <Image
                source={{ uri: memorial.photo }}
                resizeMode="cover"
                style={[
                  s.portrait,
                  { width: portraitWidth, height: portraitWidth * 1.12 },
                ]}
              />
            </View>
            <Text
              style={[
                s.eyebrow,
                {
                  color: config.engraving,
                  fontSize: Math.max(9, stoneWidth * 0.035),
                },
              ]}
            >
              {t("inMemory")}
            </Text>
            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={[
                s.name,
                {
                  color: config.lettering,
                  fontSize: stoneWidth * 0.09,
                  textShadowColor: isLightStone ? "#ffffff70" : "#000000b0",
                },
              ]}
            >
              {memorial.fullName}
            </Text>
            <Text
              style={[
                s.years,
                { color: config.engraving, fontSize: stoneWidth * 0.047 },
              ]}
            >
              {memorial.birthDate.slice(0, 4)} —{" "}
              {memorial.deathDate.slice(0, 4)}
            </Text>
            <View
              style={[s.engravedLine, { backgroundColor: config.engraving }]}
            />
            <Text
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
              style={[
                s.message,
                { color: config.lettering, fontSize: stoneWidth * 0.049 },
              ]}
            >
              {memorial.message}
            </Text>
          </View>
        </View>
        <View style={[s.plinthTop, { backgroundColor: config.stoneEdge }]} />
        <View
          style={[
            s.plinth,
            { backgroundColor: config.stone, borderColor: config.stoneEdge },
          ]}
        />
      </View>
      <Flowers color={config.flower} center={config.flowerCenter} />
      <View style={s.foregroundGrass} />
    </View>
  );
}

const s = StyleSheet.create({
  scene: {
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#afc1ba",
    position: "relative",
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
    bottom: "39%",
    backgroundColor: "#b9cac7",
  },
  sunGlow: {
    position: "absolute",
    top: "5%",
    right: "12%",
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#e4ddbd",
    opacity: 0.38,
  },
  cloud: {
    position: "absolute",
    height: 13,
    borderRadius: 15,
    backgroundColor: "#e8eeeb",
    opacity: 0.35,
  },
  cloudOne: { width: 100, left: "8%", top: "13%" },
  cloudTwo: { width: 72, right: "10%", top: "23%" },
  horizon: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "36%",
    height: "20%",
    backgroundColor: "#627566",
  },
  grassFar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "46%",
    backgroundColor: "#596b4b",
  },
  grassNear: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "25%",
    backgroundColor: "#465b38",
  },
  tree: {
    position: "absolute",
    top: "22%",
    width: 85,
    height: 130,
    opacity: 0.78,
  },
  treeCrownBack: {
    position: "absolute",
    left: 2,
    top: 2,
    width: 78,
    height: 74,
    borderRadius: 39,
    backgroundColor: "#354c3c",
  },
  treeCrown: {
    position: "absolute",
    left: 22,
    top: 28,
    width: 62,
    height: 67,
    borderRadius: 34,
    backgroundColor: "#2d4434",
  },
  treeTrunk: {
    position: "absolute",
    left: 37,
    top: 65,
    width: 13,
    height: 65,
    backgroundColor: "#514939",
  },
  distantStone: {
    position: "absolute",
    top: "43%",
    width: 35,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#808a80",
    opacity: 0.62,
  },
  distantStoneTop: {
    position: "absolute",
    left: -3,
    right: -3,
    bottom: -5,
    height: 7,
    borderRadius: 2,
    backgroundColor: "#677367",
  },
  groundShadow: {
    position: "absolute",
    alignSelf: "center",
    bottom: "5.5%",
    height: 34,
    borderRadius: 30,
    backgroundColor: "#243020",
    opacity: 0.62,
  },
  stoneAssembly: { position: "absolute", alignSelf: "center", bottom: "7.5%" },
  stoneDepth: { position: "absolute", left: 7, right: -7, top: 7, bottom: 24 },
  stone: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 29,
    overflow: "hidden",
    borderWidth: 2,
  },
  stoneHighlight: {
    position: "absolute",
    left: 3,
    top: 3,
    bottom: 3,
    width: 8,
    borderTopRightRadius: 0,
    backgroundColor: "#ffffff",
    opacity: 0.11,
  },
  stoneSideShade: {
    position: "absolute",
    top: 10,
    right: 0,
    bottom: 0,
    width: 14,
    backgroundColor: "#000",
    opacity: 0.13,
  },
  textureMark: { position: "absolute", borderRadius: 3, opacity: 0.44 },
  stoneVein: {
    position: "absolute",
    right: "8%",
    top: "34%",
    width: "27%",
    height: 32,
    borderTopWidth: 1,
    transform: [{ rotate: "-18deg" }],
    opacity: 0.14,
  },
  innerFrame: {
    position: "absolute",
    left: 11,
    right: 11,
    top: 11,
    bottom: 11,
    borderWidth: 1,
    opacity: 0.48,
  },
  geometricFrame: { borderStyle: "dashed" },
  inscription: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 19,
  },
  symbol: {
    fontSize: 27,
    lineHeight: 31,
    height: 32,
    textAlign: "center",
    textShadowColor: "#00000080",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  portraitFrame: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 100,
    marginTop: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  portrait: { borderRadius: 100 },
  eyebrow: {
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 1.7,
    fontWeight: "700",
    textAlign: "center",
  },
  name: {
    marginTop: 4,
    fontFamily: "serif",
    fontWeight: "700",
    textAlign: "center",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    lineHeight: 30,
  },
  years: {
    marginTop: 5,
    fontFamily: "serif",
    letterSpacing: 1.2,
    fontWeight: "600",
    textAlign: "center",
  },
  engravedLine: { width: "28%", height: 1, marginVertical: 9, opacity: 0.62 },
  message: {
    fontFamily: "serif",
    fontStyle: "italic",
    lineHeight: 19,
    textAlign: "center",
    opacity: 0.94,
  },
  plinthTop: {
    position: "absolute",
    left: -9,
    right: -9,
    bottom: 22,
    height: 12,
    borderRadius: 3,
  },
  plinth: {
    position: "absolute",
    left: -18,
    right: -18,
    bottom: 0,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.42,
    shadowRadius: 4,
    elevation: 5,
  },
  flowers: {
    position: "absolute",
    alignSelf: "center",
    bottom: "4.2%",
    width: 160,
    height: 58,
    zIndex: 5,
  },
  leaf: {
    position: "absolute",
    width: 50,
    height: 13,
    borderRadius: 12,
    backgroundColor: "#263f29",
  },
  leafOne: { left: 5, top: 33, transform: [{ rotate: "21deg" }] },
  leafTwo: { left: 39, top: 37, transform: [{ rotate: "-12deg" }] },
  leafThree: { right: 4, top: 32, transform: [{ rotate: "-23deg" }] },
  leafFour: { right: 40, top: 39, transform: [{ rotate: "9deg" }] },
  bloom: { position: "absolute", width: 31, height: 31 },
  petal: { position: "absolute", width: 15, height: 15, borderRadius: 10 },
  petalTop: { left: 8, top: 0 },
  petalRight: { right: 0, top: 8 },
  petalBottom: { left: 8, bottom: 0 },
  petalLeft: { left: 0, top: 8 },
  flowerCenter: {
    position: "absolute",
    left: 10,
    top: 10,
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  foregroundGrass: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 14,
    backgroundColor: "#354a2d",
    opacity: 0.85,
  },
});
