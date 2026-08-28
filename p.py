# -*- coding: utf-8 -*-
"""
Gera skins 64x64 (UV padrão Minecraft / Blockbench "Player" model)
para o cientista e a cientista de "Dimensions Alocated".

Requisitos: pip install pillow
Saída: scientist_male.png, scientist_female.png
"""

from PIL import Image

SIZE = 64
TRANSPARENT = (0, 0, 0, 0)


# ----------------------------------------------------------------------
# Utilidades de cor
# ----------------------------------------------------------------------
def rgb(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def mul(c, f):
    """Escurece/clareia mantendo alpha."""
    return (
        max(0, min(255, int(c[0] * f))),
        max(0, min(255, int(c[1] * f))),
        max(0, min(255, int(c[2] * f))),
        c[3],
    )


# ----------------------------------------------------------------------
# Regiões de UV
# ----------------------------------------------------------------------
class Face:
    """Retângulo na textura, com coordenadas locais."""

    def __init__(self, img, x, y, w, h):
        self.img = img
        self.x, self.y, self.w, self.h = x, y, w, h

    def px(self, lx, ly, color):
        if 0 <= lx < self.w and 0 <= ly < self.h:
            self.img.putpixel((self.x + lx, self.y + ly), color)

    def rect(self, lx, ly, w, h, color):
        for j in range(ly, ly + h):
            for i in range(lx, lx + w):
                self.px(i, j, color)

    def fill(self, color):
        self.rect(0, 0, self.w, self.h, color)

    def vshade(self, top=1.06, bottom=0.88):
        """Gradiente vertical suave sobre o que já está pintado."""
        for j in range(self.h):
            t = j / max(1, self.h - 1)
            f = top + (bottom - top) * t
            for i in range(self.w):
                c = self.img.getpixel((self.x + i, self.y + j))
                if c[3]:
                    self.img.putpixel((self.x + i, self.y + j), mul(c, f))

    def hshade(self, left=1.05, right=0.9):
        for i in range(self.w):
            t = i / max(1, self.w - 1)
            f = left + (right - left) * t
            for j in range(self.h):
                c = self.img.getpixel((self.x + i, self.y + j))
                if c[3]:
                    self.img.putpixel((self.x + i, self.y + j), mul(c, f))

    def outline(self, color):
        for i in range(self.w):
            self.px(i, 0, color)
            self.px(i, self.h - 1, color)
        for j in range(self.h):
            self.px(0, j, color)
            self.px(self.w - 1, j, color)


class Box:
    """
    Layout padrão de caixa Minecraft a partir da origem (u, v):
      top   = (u+d,     v,     w, d)
      bottom= (u+d+w,   v,     w, d)
      right = (u,       v+d,   d, h)
      front = (u+d,     v+d,   w, h)
      left  = (u+d+w,   v+d,   d, h)
      back  = (u+d+w+d, v+d,   w, h)
    """

    def __init__(self, img, u, v, w, h, d):
        self.top = Face(img, u + d, v, w, d)
        self.bottom = Face(img, u + d + w, v, w, d)
        self.right = Face(img, u, v + d, d, h)
        self.front = Face(img, u + d, v + d, w, h)
        self.left = Face(img, u + d + w, v + d, d, h)
        self.back = Face(img, u + d + w + d, v + d, w, h)

    @property
    def faces(self):
        return [self.top, self.bottom, self.right, self.front, self.left, self.back]

    def fill(self, color):
        for f in self.faces:
            f.fill(color)

    def sides(self, color):
        for f in (self.right, self.front, self.left, self.back):
            f.fill(color)

    def shade(self):
        self.front.vshade()
        self.back.vshade(1.0, 0.82)
        self.right.vshade(1.0, 0.85)
        self.left.vshade(0.96, 0.8)
        self.top.vshade(1.10, 1.02)
        self.bottom.fill_dark = None
        self.bottom.vshade(0.72, 0.72)


def parts(img):
    """Todas as caixas da skin 64x64 (base + camadas)."""
    return {
        "head":       Box(img, 0, 0, 8, 8, 8),
        "hat":        Box(img, 32, 0, 8, 8, 8),
        "body":       Box(img, 16, 16, 8, 12, 4),
        "jacket":     Box(img, 16, 32, 8, 12, 4),
        "arm_r":      Box(img, 40, 16, 4, 12, 4),
        "sleeve_r":   Box(img, 40, 32, 4, 12, 4),
        "arm_l":      Box(img, 32, 48, 4, 12, 4),
        "sleeve_l":   Box(img, 48, 48, 4, 12, 4),
        "leg_r":      Box(img, 0, 16, 4, 12, 4),
        "pants_r":    Box(img, 0, 32, 4, 12, 4),
        "leg_l":      Box(img, 16, 48, 4, 12, 4),
        "pants_l":    Box(img, 0, 48, 4, 12, 4),
    }


# ----------------------------------------------------------------------
# Paletas
# ----------------------------------------------------------------------
PALETTE_M = {
    "skin":       rgb("c98d63"),
    "skin_dk":    rgb("a56c48"),
    "skin_lt":    rgb("dda67c"),
    "hair":       rgb("3b2b22"),
    "hair_dk":    rgb("241a14"),
    "hair_lt":    rgb("55402f"),
    "eye":        rgb("2b3a4a"),
    "eye_w":      rgb("e8eef2"),
    "mouth":      rgb("8a5340"),
    "coat":       rgb("e6ebf2"),
    "coat_sh":    rgb("bcc4d1"),
    "coat_dk":    rgb("9aa3b2"),
    "shirt":      rgb("2e6d7a"),
    "shirt_dk":   rgb("21525c"),
    "pants":      rgb("39404d"),
    "pants_dk":   rgb("272d38"),
    "boot":       rgb("4a3627"),
    "boot_dk":    rgb("32241a"),
    "glove":      rgb("d6d9de"),
    "metal":      rgb("8f9aa8"),
    "lens":       rgb("6fd7c6"),
    "strap":      rgb("2a2a30"),
    "accent":     rgb("c0392b"),
}

PALETTE_F = dict(PALETTE_M)
PALETTE_F.update({
    "skin":       rgb("e0aa82"),
    "skin_dk":    rgb("bd8460"),
    "skin_lt":    rgb("f0c39c"),
    "hair":       rgb("8c3f22"),
    "hair_dk":    rgb("5e2814"),
    "hair_lt":    rgb("b35a2e"),
    "eye":        rgb("2f5a3a"),
    "mouth":      rgb("a8524a"),
    "shirt":      rgb("6b4a86"),
    "shirt_dk":   rgb("4d3363"),
    "pants":      rgb("323a4a"),
    "pants_dk":   rgb("222834"),
    "lens":       rgb("ffd27a"),
})


# ----------------------------------------------------------------------
# Pintura
# ----------------------------------------------------------------------
def paint_head(p, P, female):
    head, hat = p["head"], p["hat"]

    # base: pele em todas as faces
    head.fill(P["skin"])

    # ---------------- cabelo (base) ----------------
    head.top.fill(P["hair"])
    # franja / linha do cabelo
    head.front.rect(0, 0, 8, 2, P["hair"])
    head.front.rect(0, 2, 1, 1, P["hair"])
    head.front.rect(7, 2, 1, 1, P["hair"])
    if female:
        head.front.rect(0, 2, 2, 2, P["hair"])
        head.front.rect(6, 2, 2, 2, P["hair"])
        head.front.px(3, 2, P["hair_lt"])
    head.back.rect(0, 0, 8, 5 if female else 3, P["hair"])
    head.right.rect(0, 0, 8, 4 if female else 3, P["hair"])
    head.left.rect(0, 0, 8, 4 if female else 3, P["hair"])
    # costeletas / laterais
    head.right.rect(6, 3, 2, 2, P["hair_dk"])
    head.left.rect(0, 3, 2, 2, P["hair_dk"])

    # ---------------- rosto ----------------
    f = head.front
    # olhos
    f.rect(1, 4, 2, 1, P["eye_w"])
    f.rect(5, 4, 2, 1, P["eye_w"])
    f.px(2, 4, P["eye"])
    f.px(5, 4, P["eye"])
    # sobrancelhas
    f.px(1, 3, P["hair_dk"])
    f.px(2, 3, P["hair_dk"])
    f.px(5, 3, P["hair_dk"])
    f.px(6, 3, P["hair_dk"])
    if female:  # cílios
        f.px(1, 5, P["hair_dk"])
        f.px(6, 5, P["hair_dk"])
    # nariz e boca
    f.px(3, 5, P["skin_dk"])
    f.px(4, 5, P["skin_lt"])
    f.rect(3, 6, 2, 1, P["mouth"])
    # sombra do maxilar
    f.rect(0, 7, 8, 1, P["skin_dk"])
    f.px(0, 6, P["skin_dk"])
    f.px(7, 6, P["skin_dk"])
    # orelhas
    head.right.px(7, 5, P["skin_dk"])
    head.left.px(0, 5, P["skin_dk"])

    # ---------------- camada hat: volume de cabelo + óculos ----------------
    hat.fill(TRANSPARENT)
    hat.top.fill(P["hair_lt"])
    hat.back.rect(0, 0, 8, 6 if female else 3, P["hair"])
    hat.right.rect(0, 0, 8, 3, P["hair"])
    hat.left.rect(0, 0, 8, 3, P["hair"])
    hat.front.rect(0, 0, 8, 2, P["hair_lt"])

    if female:
        # cauda de cavalo descendo pela nuca
        hat.back.rect(3, 3, 2, 5, P["hair_dk"])
        hat.back.px(3, 2, P["hair_lt"])
        hat.back.rect(2, 4, 1, 3, P["hair"])
        hat.back.rect(5, 4, 1, 3, P["hair"])
        # laço
        hat.back.rect(3, 2, 2, 1, P["accent"])
    else:
        hat.back.rect(0, 3, 8, 1, P["hair_dk"])

    # óculos de proteção erguidos na testa (faixa contínua)
    for face in (hat.front, hat.right, hat.left, hat.back):
        face.rect(0, 2, face.w, 1, P["strap"])
    hat.front.rect(1, 1, 6, 2, P["metal"])
    hat.front.rect(1, 2, 2, 1, P["lens"])
    hat.front.rect(5, 2, 2, 1, P["lens"])
    hat.front.px(3, 2, P["metal"])
    hat.front.px(4, 2, P["metal"])

    head.front.hshade(1.03, 0.94)
    head.right.vshade(1.0, 0.9)
    head.left.vshade(0.95, 0.86)
    head.back.vshade(1.0, 0.88)
    head.bottom.fill(mul(P["skin_dk"], 0.75))


def paint_body(p, P, female):
    body, jacket = p["body"], p["jacket"]

    # torso: camisa por baixo
    body.fill(P["shirt"])
    body.top.fill(P["coat"])
    body.bottom.fill(P["coat_dk"])

    # jaleco fechado nas costas e laterais, aberto na frente
    body.back.fill(P["coat"])
    body.right.fill(P["coat"])
    body.left.fill(P["coat"])

    fr = body.front
    # abas do jaleco (frente): brancas nas bordas, camisa no centro
    fr.rect(0, 0, 3, 12, P["coat"])
    fr.rect(5, 0, 3, 12, P["coat"])
    # gola / lapelas
    fr.rect(2, 0, 1, 3, P["coat_sh"])
    fr.rect(5, 0, 1, 3, P["coat_sh"])
    fr.px(3, 0, P["shirt_dk"])
    fr.px(4, 0, P["shirt_dk"])
    # gravata / crachá
    if female:
        fr.rect(3, 1, 2, 4, P["shirt_dk"])
    else:
        fr.rect(3, 1, 1, 5, P["accent"])
        fr.px(4, 1, P["shirt_dk"])
    # bolso com caneta
    fr.rect(1, 5, 2, 2, P["coat_sh"])
    fr.px(1, 4, P["metal"])
    # botões
    fr.px(5, 6, P["coat_dk"])
    fr.px(5, 9, P["coat_dk"])
    # cinto de utilidades
    fr.rect(0, 10, 8, 1, P["boot_dk"])
    body.back.rect(0, 10, 8, 1, P["boot_dk"])
    body.right.rect(0, 10, 4, 1, P["boot_dk"])
    body.left.rect(0, 10, 4, 1, P["boot_dk"])
    fr.px(3, 10, P["metal"])
    fr.px(4, 10, P["metal"])
    # frasco no cinto (lateral)
    body.left.rect(1, 11, 2, 1, P["lens"])

    # costas: costura + emblema
    body.back.rect(0, 3, 8, 1, P["coat_sh"])
    body.back.rect(3, 5, 2, 2, P["lens"])

    body.shade()

    # camada jacket: sobras do jaleco (ombros e barra)
    jacket.fill(TRANSPARENT)
    for face, w in ((jacket.front, 8), (jacket.back, 8), (jacket.right, 4), (jacket.left, 4)):
        face.rect(0, 0, w, 2, P["coat"])          # ombros
        face.rect(0, 9, w, 3, P["coat_sh"])       # barra do jaleco
    jacket.front.rect(3, 9, 2, 3, TRANSPARENT)     # abertura frontal
    jacket.front.rect(2, 0, 4, 1, P["coat_sh"])
    jacket.top.fill(P["coat"])
    for face in (jacket.front, jacket.back, jacket.right, jacket.left):
        face.vshade(1.04, 0.9)


def paint_arm(box, sleeve, P, female, right=True):
    box.fill(P["skin"])
    box.top.fill(P["coat"])
    # manga do jaleco (2/3 superiores)
    for face in (box.front, box.back, box.right, box.left):
        face.rect(0, 0, face.w, 7, P["coat"])
        face.rect(0, 6, face.w, 1, P["coat_sh"])
    # luva
    for face in (box.front, box.back, box.right, box.left):
        face.rect(0, 10, face.w, 2, P["glove"])
    box.bottom.fill(P["glove"])
    # detalhe de pele/punho
    box.front.rect(0, 9, 4, 1, P["skin_dk"])
    box.shade()

    sleeve.fill(TRANSPARENT)
    for face in (sleeve.front, sleeve.back, sleeve.right, sleeve.left):
        face.rect(0, 0, face.w, 7, P["coat"])
        face.rect(0, 6, face.w, 1, P["coat_dk"])
    sleeve.top.fill(P["coat"])
    # braçadeira: vermelha no braço direito, amarela no esquerdo
    band = P["accent"] if right else P["lens"]
    for face in (sleeve.front, sleeve.back, sleeve.right, sleeve.left):
        face.rect(0, 2, face.w, 1, band)
    for face in (sleeve.front, sleeve.back, sleeve.right, sleeve.left):
        face.vshade(1.05, 0.9)


def paint_leg(box, pants, P, female):
    box.fill(P["pants"])
    box.top.fill(P["pants_dk"])
    # bota
    for face in (box.front, box.back, box.right, box.left):
        face.rect(0, 8, face.w, 4, P["boot"])
        face.rect(0, 8, face.w, 1, P["boot_dk"])
        face.rect(0, 11, face.w, 1, P["boot_dk"])
    box.bottom.fill(P["boot_dk"])
    # cordão / vinco
    box.front.px(1, 9, P["metal"])
    box.front.px(2, 10, P["metal"])
    box.front.rect(1, 3, 1, 4, P["pants_dk"])
    box.shade()

    pants.fill(TRANSPARENT)
    # sobreposição só no quadril, para dar volume ao jaleco/calça
    for face in (pants.front, pants.back, pants.right, pants.left):
        face.rect(0, 0, face.w, 3, P["pants"])
        face.rect(0, 2, face.w, 1, P["pants_dk"])
    pants.top.fill(P["pants"])


def build_skin(female: bool) -> Image.Image:
    P = PALETTE_F if female else PALETTE_M
    img = Image.new("RGBA", (SIZE, SIZE), TRANSPARENT)
    p = parts(img)

    paint_head(p, P, female)
    paint_body(p, P, female)
    paint_arm(p["arm_r"], p["sleeve_r"], P, female, right=True)
    paint_arm(p["arm_l"], p["sleeve_l"], P, female, right=False)
    paint_leg(p["leg_r"], p["pants_r"], P, female)
    paint_leg(p["leg_l"], p["pants_l"], P, female)

    return img


if __name__ == "__main__":
    build_skin(False).save("scientist_male.png")
    build_skin(True).save("scientist_female.png")
    print("OK: scientist_male.png / scientist_female.png (64x64)")