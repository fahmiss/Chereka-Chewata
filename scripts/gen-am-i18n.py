#!/usr/bin/env python3
"""Generate src/i18n/am.ts from unicode-escape map (ASCII-only source)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Values are unicode-escape sequences decoded at runtime.
RAW: dict[str, str] = {
    "common.continue": r"\u1240\u1325\u120d",
    "common.back": r"\u1270\u1218\u1208\u1235",
    "common.play": r"\u1270\u132b\u12c8\u1275",
    "common.settings": r"\u1245\u1295\u1265\u122e\u127d",
    "common.soon": r"\u1260\u1245\u122d\u1265",
    "common.gotIt": r"\u1308\u1263\u129d",
    "common.end": r"\u12a0\u1241\u121d",
    "common.home": r"\u1218\u1290\u123b",
    "home.tagline": r"\u12a0\u1295\u12f5 \u1235\u120d\u12ad\u1362 \u12a0\u1235\u1270\u120b\u120d\u134d\u1362 \u12a0\u1265\u1228\u12cd \u1270\u132b\u12c8\u1271\u1362",
    "home.play": r"\u1270\u132b\u12c8\u1275",
    "home.comingNext": r"\u1260\u1245\u122d\u1265 \u12e8\u121a\u1218\u1321",
    "language.title": r"\u1218\u1270\u130d\u1260\u122a\u12eb\u12cd \u12a5\u1295\u12f4\u1275 \u12a5\u1295\u12f0\u121a\u1293\u1308\u122d \u12a5\u1293 \u12ab\u122d\u12f6\u1279 \u12e8\u1275\u129b\u12cd\u1295 \u124b\u1295\u124b \u12a5\u1295\u12f0\u121a\u1320\u1240\u1219 \u12ed\u121d\u1228\u1321\u1362",
    "language.interface": r"\u1260\u12ed\u1290\u1308\u133d",
    "language.content": r"\u12ed\u12d8\u1275",
    "language.english": r"\u12a5\u1295\u130d\u120a\u12dd\u129b",
    "language.amharic": r"\u12a0\u121b\u122d\u129b",
    "language.mixed": r"\u12f5\u1265\u120d\u1245",
    "language.interfaceEn": r"\u121d\u1293\u120c\u12ce\u127d \u12a5\u1293 \u12a0\u12dd\u122b\u122e\u127d \u1260\u12a5\u1295\u130d\u120a\u12dd\u129b",
    "language.interfaceAm": r"\u121d\u1293\u120c\u12ce\u127d \u1260\u12a0\u121b\u122d\u129b",
    "language.contentEn": r"\u12e8\u1308\u12cb\u1273 \u12f0\u1265\u1270\u122e\u127d \u1218\u1300\u1218\u122a\u12eb \u1260\u12a5\u1295\u130d\u120a\u12dd\u129b",
    "language.contentAmSoon": r"\u12e8\u12a0\u121b\u122d\u129b \u12f0\u1265\u1270\u122d \u1232\u1218\u1323",
    "language.contentMixedSoon": r"\u1263\u1208\u1201\u1208\u1275 \u124b\u1295\u124b \u12f0\u1265\u1270\u122e\u127d \u1232\u1218\u1321",
    "settings.title": r"\u1245\u1295\u1265\u122e\u127d",
    "settings.language": r"\u124b\u1295\u124b",
    "settings.interfaceLanguage": r"\u12e8\u1260\u12ed\u1290\u1308\u133d \u124b\u1295\u124b",
    "settings.contentNote": r"\u12e8\u12ed\u12d8\u1275 \u124b\u1295\u124b\u1361 \u12a5\u1295\u130d\u120a\u12dd\u129b \u12f0\u1265\u1270\u122d\u1362 \u12a0\u121b\u122d\u129b \u12a5\u1293 \u12f5\u1265\u120d\u1245 \u12a5\u1290\u12da\u12eb \u1264\u1270-\u1218\u133b\u1215\u134d\u1275 \u1232\u1218\u1321 \u12ed\u12a8\u1348\u1273\u1209\u1362",
    "settings.feel": r"\u1235\u121c\u1275",
    "settings.sound": r"\u12f5\u121d\u133d",
    "settings.soundHint": r"\u1260\u1308\u12cb\u1273 \u12c8\u1245\u1275 \u12a0\u130b\u130b\u122d \u121d\u120d\u12ad\u1276\u127d\u1362 \u1270\u133d\u12a5\u1296\u12ce\u127d \u1240\u1325\u120e \u12ed\u1218\u1323\u1209\u1362",
    "settings.vibration": r"\u1295\u12dd\u1228\u1275",
    "settings.vibrationHint": r"\u1260\u1218\u1295\u12ab\u1275\u1363 \u1260\u1218\u130d\u1208\u133d \u12a5\u1293 \u1260\u12f5\u121d\u133d \u120b\u12ed \u1203\u1355\u1272\u12ad\u1235\u1362",
    "settings.reduceMotion": r"\u12a5\u1295\u1245\u1235\u1243\u1234\u1295 \u1240\u1295\u1235",
    "settings.reduceMotionHint": r"\u12a0\u130b\u122d \u12a5\u1293 \u12e8\u1240\u1208\u1208 \u12a5\u1295\u1245\u1235\u1243\u1234\u1362 \u12e8\u1235\u122d\u12d3\u1271\u1295 \u121b\u1265\u122a\u12eb/\u121b\u1325\u134a\u12eb\u121d \u12eb\u12a8\u1265\u122b\u120d\u1362",
    "settings.content": r"\u12ed\u12d8\u1275",
    "settings.resetBody": r"\u12ed\u1205 \u1235\u120d\u12ad \u12a0\u1235\u1240\u12f5\u121e \u12eb\u12eb\u1278\u12cd\u1295 \u12ab\u122d\u12f6\u127d \u12eb\u1338\u12f3\u120d\u1363 \u1235\u1208\u12da\u1205 \u12a5\u1295\u12f0\u1308\u1293 \u1218\u132b\u12c8\u1275 \u12a8\u1219\u1209 \u12f0\u1265\u1270\u122d \u12ed\u1218\u122d\u1323\u120d\u1362",
    "settings.resetLabel": r"\u12e8\u1245\u122d\u1265 \u12ab\u122d\u12f6\u127d\u1295 \u12a0\u1235\u1300\u121d\u122d",
    "settings.resetTitle": r"\u12e8\u1245\u122d\u1265 \u12ab\u122d\u12f6\u127d\u1295 \u12a0\u1235\u1300\u121d\u122d?",
    "settings.resetMessage": r"\u12ed\u1205 \u1235\u120d\u12ad \u12e8\u1233\u1263\u1278\u12cd\u1295 \u12ab\u122d\u12f6\u127d \u12ed\u1228\u1233\u120d\u1362 \u12e8\u1270\u132b\u12cb\u127e\u127d \u1235\u121e\u127d \u12ed\u1240\u122b\u1209\u1362",
    "settings.resetConfirm": r"\u12a0\u1235\u1300\u121d\u122d",
    "settings.resetDoneTitle": r"\u12ab\u122d\u12f6\u127d \u1270\u1300\u1218\u1229",
    "settings.resetDoneMessage": r"\u12e8\u1245\u122d\u1265 \u12ab\u122d\u12f5 \u1273\u122a\u12ad \u1260\u12da\u1205 \u1235\u120d\u12ad \u1270\u133d\u122f\u120d\u1362",
    "settings.comingLater": r"\u1260\u12a1\u120b",
    "settings.comingLaterBody": r"\u12e8\u130d\u120b\u12ca\u1290\u1275 \u1356\u120a\u1232 \u12a5\u1293 \u12cd\u120e\u127d\u1362",
    "settings.version": r"v0.1.0 \u00b7 \u12a5\u1295\u130d\u120a\u12dd\u129b \u12f0\u1265\u1270\u122d",
    "game.howToPlay": r"\u12a5\u1295\u12f4\u1275 \u1218\u132b\u12c8\u1275",
    "game.comingSoon": r"\u1260\u1245\u122d\u1265",
    "game.playGame": r"{name} \u1270\u132b\u12c8\u1275",
    "game.notFound": r"\u1308\u12cb\u1273 \u12a0\u120d\u1270\u1308\u1298\u121d",
    "game.backHome": r"\u12c8\u12f0 \u1218\u1290\u123b",
    "game.rulesLater": r"\u1219\u1209 \u1205\u130e\u127d \u12ed\u1205 \u1308\u12cb\u1273 \u1232\u12c8\u1323 \u12ed\u12a8\u1348\u1273\u1209\u1362",
    "setup.players": r"\u1270\u132b\u12cb\u127e\u127d",
    "setup.playersTitle": r"\u121b\u1295 \u12a5\u12e8\u1270\u132b\u12c8\u1270 \u1290\u12cd?",
    "setup.playersSubtitle": r"{min}\u2013{max} \u1270\u132b\u12cb\u127e\u127d\u1362 \u1235\u121e\u127d \u1260\u12da\u1205 \u1235\u120d\u12ad \u12ed\u1240\u122b\u1209\u1362",
    "setup.categories": r"\u121d\u12f5\u1266\u127d",
    "setup.categoriesTitle": r"\u121d\u12f5\u1266\u127d\u1295 \u121d\u1228\u1325",
    "setup.categoriesSubtitle": r"\u12a5\u1295\u130d\u120a\u12dd\u129b \u1218\u1300\u1218\u122a\u12eb \u12f0\u1265\u1270\u122d\u1362 \u12a5\u1295\u12f0\u1348\u1208\u1301 \u12ed\u1240\u120b\u1240\u1209\u1362",
    "setup.content": r"\u12ed\u12d8\u1275",
    "setup.contentTitle": r"\u12e8\u12ed\u12d8\u1275 \u12f0\u1228\u1303",
    "setup.contentSubtitle": r"\u1264\u1270\u1230\u1265 \u1290\u1263\u122a \u1290\u12cd\u1362 \u12f0\u1228\u1303\u12ce\u127d \u12ed\u12f0\u122b\u1228\u1263\u1209\u1362",
    "setup.options": r"\u12a0\u121b\u122b\u130e\u127d",
    "setup.review": r"\u130d\u121d\u1308\u121b",
    "setup.reviewTitle": r"\u1208\u1218\u132b\u12c8\u1275 \u12dd\u130d\u1301?",
    "setup.reviewSubtitle": r"\u12a0\u1295\u12f5 \u1235\u120d\u12ad\u1362 \u1260\u1325\u1295\u1243\u1244 \u12a0\u1235\u1270\u120b\u120d\u134d\u1362",
    "setup.startGame": r"\u1308\u12cb\u1273 \u1300\u121d\u122d",
    "setup.selectAll": r"\u1201\u1209\u1295\u121d \u121d\u1228\u1325",
    "session.endTitle": r"\u1308\u12cb\u1273\u12cd\u1295 \u12a0\u1241\u121d?",
    "session.endMessage": r"\u12ed\u1205 \u12d9\u122d \u12ed\u1320\u134b\u120d\u1362 \u121a\u1235\u1325\u122e\u127d \u12ed\u1338\u12f3\u1209\u1362",
    "session.endConfirm": r"\u1308\u12cb\u1273 \u12a0\u1241\u121d",
    "session.keepPlaying": r"\u1218\u132b\u12c8\u1275 \u1240\u1325\u120d",
    "session.unavailableTitle": r"\u12ad\u134d\u1208-\u130a\u12dc \u12a0\u12ed\u1308\u129d\u121d",
    "session.unavailableBody": r"\u121a\u1235\u1325\u122e\u127d \u1260\u121b\u1205\u12f0\u1228 \u1275\u12cd\u1235\u1273 \u1265\u127b \u1293\u1278\u12cd\u121d\u1363 \u1260\u12a0\u1308\u1293\u129d \u12cd\u1235\u1325 \u12a0\u12ed\u12f0\u1209\u121d\u1362 \u12a8\u1218\u1290\u123b \u12a0\u12f2\u1235 \u1308\u12cb\u1273 \u1300\u121d\u122d\u1362",
}


def main() -> None:
    am = {k: v.encode("utf-8").decode("unicode_escape") for k, v in RAW.items()}
    en_text = (ROOT / "src/i18n/en.ts").read_text(encoding="utf-8")
    en_keys = re.findall(
        r"'((?:common|home|language|settings|game|setup|session)\.[^']+)':",
        en_text,
    )
    missing = [k for k in en_keys if k not in am]
    extra = [k for k in am if k not in en_keys]
    if missing or extra:
        raise SystemExit(f"key mismatch missing={missing} extra={extra}")

    lines = [
        "import type { MessageKey } from './en';",
        "",
        "/** Amharic interface chrome — content decks stay English until those packs ship. */",
        "export const am: Record<MessageKey, string> = {",
    ]
    for key, value in am.items():
        lines.append(f"  {json.dumps(key)}: {json.dumps(value, ensure_ascii=False)},")
    lines += ["};", ""]
    out = ROOT / "src/i18n/am.ts"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {out} ({len(am)} keys)")
    print("sample:", am["home.tagline"])


if __name__ == "__main__":
    main()
