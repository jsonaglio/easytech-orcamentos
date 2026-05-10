import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Constantes ───────────────────────────────────────────────
const TAXA_PRAZO = 0.10
const prazoPreco = (v) => Number(v) * (1 + TAXA_PRAZO)
const fmtBRL = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (d) => d.toLocaleDateString('pt-BR')
const pad = (n) => String(n).padStart(2, '0')

// Ícones PNG por categoria (base64, verde #22C55E)
const CAT_ICON_B64 = {{
  motherboard: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAEnklEQVR4nO2aTWhcVRSAv3NfyE8XtuIuVupMRloRUgRL27RjFXFjsS6UBtN0qGDqwmpXpttu7cq6UAyodRqLVlALurJgSzJtxEIEEUo7mdimVJAWxEU7CfPecZE32GR+38t9mQkzHwy8e98995573rnn3nfeQJs2bVoZqXYzNjG81TjOdlV9eLUUsov8LeJOzAyMZyu2KFeZmDrwkOeaj0AORKfcqqHAhz0b7o/+8dQ3C8tvdpST8ArOxwhDkau2Oghw9N4/3QIcLXdzCbGJ4a1izG9+UUHPgNyKWMlIUNgi8Ipf9PB4MpdMX3uwTYkH+Gu+2MWZ3K7Tw1ErGiV9mdQ5hX2AUdEksMQAZrmAqvb+X5KKwWOtoDBdvBaRx5bfLzFAq9HyBii7C9SFHjexTPYJcUyJW1UdsNCRu5b8LBd6XMuEMkBscnizZHJnEdOPF0y2YAr0ZVJTFJz9M3s+nwOIZYY2CR2fAkmgs4LoPHDedb2RG8+O/xVG73IEXwJ63AjmLEJ/2EEVdmiH+1Wx7E/+BSpPHqAL2Os4ZizsuOUI7AHxyVwC409e5QMc/TGIvHjsVxgBBvouDSf8Y2oSwDju+uyOL/8tJ7fll9QjCwXuAC8G1bkagQ1gML2e7/dG5Vx25xcXgsgnJg4V1HgjAOJ2bASy+E++0uQBrm5P341nUrDoCdYIHwQfoPfK4XU9C/n3VRkEEOHr+53dx24/M3bPRv9RYsUA3fn5Eyq8XSyrcqQ7Py/AERv9R4mlc4C+WlIlvBagg3lYXOeVGsSvHF7vX5a80a0EKx6AoGWq3AA9nAf2LhS446/zUubzxZ4vBtavCnY8QOXbkiqV7+oVd11vBPgByFdptgDyE6pvhtCwIlY8IN/dNdqzkNclQbCr61i98v7B5mUbugTFigH8aP+O/1tT2IkBKyQ+efAlRMaAR2s0/dN45o1s8tQFW2M3x9ugyCfUnjzA455xT9gcuik8ANgIkNuVrpqljmdSCrLN5sDN4QENJLAHqFO4hS7aTY03FL+cCtSH63n7io/Zw7sddHzbBDbAzM7xmdil1GWBnQojeIwEkS9OXmF6dnf6ul/6FWTboovX5GYwjasTfAkIagrOoMLlsIMqTItjBosnSOM5owizdYjOiZi3wo5bjlBB0M/kDGy6eDDmdEpfIOECN2d3p68/eHz2t7V4GF1Wyop2gRt7Ts9CXU+uaWn5XaDlDRAuK1xfFtc2TZIVpu4srm2aIyvsUzOLa5uossJhY0DNLK5trm5P3/UvrWaFWz4IhjVAzSSmbZotKVo7iWmbZkqK1pnEtE3zJEUbmcS0jfWMUGLi0HOe8X4GMJ55vpi/s1Vvm/Yu0GgFGk3bAI1WoNG0DdBoBRpNyxvA+jnA369LvvDYqrdNy3tA2wDLK1R1rngt8PTqqhMFmiheiUjJp7iSGCAqEwgeYBT2xTKp72UFX4EaitIPvF4sekanljcpG2RimYMnBXk3QtVWHYHTM7vSJcmLsjFg3Yb8e8BJKP331xplXBy37H8Wq24zfZeGE6pOEnRzNHpFi6IzIs5UbuDU743WpU2bNs3Jf86SlfpTvPKQAAAAAElFTkSuQmCC',
  cpu: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAADuklEQVR4nO2bwW8TRxTGvzezjhqQUuBEiFIUb6QUIRH1hBRIoKhnei5xrPrSE4IT/B9waCUuoMRKD1zgjkSMFcitSIgDFbaUAg2qQEorQSrb814P2TgJ8hqYmWQbeX6nHb2d97592pl5M2sDgUAgEAh4Ja6UhuNKaXin7D4h3w7jSmlYIvMMAKilx2pnbr7wafeN8u2QlMQA+gH0J9de7b7xnoC9RkhA1gKyJiQgawFZ42UZHKkWxpXWJ0XkIIHyAvlp3TndEEh9e0A3e3LXX0SmWpsoP3fV7pSA0aXpATbqZ4CmXYVYIACu9x9Yu/r0+O2GrZPIRQG39C8gXHDx4QABuPx+9QsCcNnFiRUj1cI4KfU4aQog8wC9TFoDifd/OnZ2tAvwNQHfJ00G41h9cvZ3m+ewfgOSMb8hab5+aq5g68uGeLF4V4DzAJSQTAKwSoD1KiAiRzZb5DwZfXZ84Ld2dCLrjVPXNyCulIalz4x1FCCSJ/G+l7JCSPL5R8XvOtmooZ9121ClJqC9K2P0d3S8dfogGtiuCDS0MD1Emg8potxH9HeFNTV0i94sT5VfY33m34yZDEESmoFgplN/icxaXCml7iqdVoE0hhamh3KaYwMahIhTDMWqwdxaOfqggOWp8oovjRukiqudufkirpTGugyBIgnNJI1tszVpPmSUOoyWeQWt3rsI1MT7TRQNGiWrADYTsCWmkMwR0Wyn/tZDAFhPAoCOnfOLxdNp/RRRDsw514cHAMN4BzF9Sqgv7R4SqtcnZu/Z+O/5vUBIQNYCsibUAWkGpzpgN/BUB4QhkGZwqQN2hf9zHbDbhDrAgZCArAVkTagD0gyhDugRQh3QLYZtHcCaGopVQxPvN4x33WJ8DDG8D5FuCnMz7R6XOmBHjsR0i94wt1ZMFA1CTOpBxicR6WZEstJstt56krfd/U44XZ4qvz76oABjZFWp9JOcT0GYm80o9/blufk/fenbyo4kAIAkB5jeDzF90/OrgMuXofbkSMA3fuR8loLRdnwi6+FhPQRIqAoCA1ACnB9ZLN4h4FGi6Mt1jfJ3586OdsEJAD9sNFnJktVDwPH3ASOLM9cIdMnFhysEzNVOzRZt+zvNAfsO/HsFwDVs/WS1u5RJm4suDrzsZuKHhVERPQnIGICvsPl6/grgjw9ud7VDIDUivVSfuPXEVbv37dxo9cezrPg+AChW3z6fvLXg0+6bsAxmLSBrQgKyFpA1PZ8A75shYapBYa197dm+J9hLf5kJBAKBQC/zH+HZDxFOkiREAAAAAElFTkSuQmCC',
  ram: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAACiElEQVR4nO3Zv2sTYRzH8ff3rrTqYCs6CSJJC1YEi1OlIS7iVKyzbcxkncRO6t/gWAcFoSBp7eKi4GYXiacVBAURRNqAKAqiIA7aht49Dt5hkVx+nJc8kXxfS56758PDly/PPSE5UEoppZRSSimlVK+RZkKZcmHMcd1xY8yedheUDvks4pfXJ5bWGibrTY6szuwOfOcGyEx6xXWMAa7vHPp55fWRu9W4UF+9FYIt9ybCdOqldYYAcz++7RBgrl6opky5MCaO8zK8NGCWQT6kXGRbGBgVOBNeBgQcruRLb2tlY3dA+MxHSy5XcouFtAttp2GveN/AFOAYMXmgZgOcuAWMMfv/XEnDw6TbGHgRjUXkQFwutgG9ou4hGCfjTR8U+haAPNAf3t4EVnw/mH13YumTzVwrEu2AsIiT24oAGAAmXde5ZTvXiqSPQB7Acf3BSq4klVxJ+vvYF86d6oJc05I2oB9g7fid79GNN+Olr+FwoAtyTev5Q1AbYLsA27QBtguwTRtguwDbtAG2C7BNG2C7ANuSNmATYPRZcW90I/v8wmA4rHZBrmmJ/g8AVoDJ6hZfsl4xLG0jnJJHXZBrWqId4PvBLPAA2Nh2uwryEGPO2861ItEOCP95Od2tuVboIRg3YYx5H40FjnWmnDSZkWgkIh/jUrGPgBgpIwSAY2Aq4xXvCTxNucr2MBwFzkaXgWNW46J13w1mvHPzglxKsbSOE1hcz5WKcfN1z4BdQxuXgXl+v2j8Hy2J61+sF2jq9fjwk8KIMW4ezKG/pq6Gn9caLNHRnMGsi7irlYnbrxqs82+yXtFkvWLD3WEr1wz9GrRdgG0934CkP4Yij7s8p5RSSimllKrtF5D2NSIfochgAAAAAElFTkSuQmCC',
  gpu: 'data:image/png;base64,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',
  ssd: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAADi0lEQVR4nO2az29UVRTHP+fOG8gYTYlpYom2mbboTggaBfojlIUx+gd0odMaXbBz6cKFiUlJ4F+QjaVTV90T1AWQaYsENQZXJp3+oGAgEgQj2DLz3nHRaYE3b7B9uXeG2vtZ3fvOfWe+97wz97x33wOPx+PxeDwez85EnmYcOj8ULGVfOSZiXgeyTdJkB2GFiJ/m+ydmELTxsAZ0lwoHxJgzwAEnApuGXlHVkYWByd+SrIkBqE3+MrDbqbbmcdtkwoNzh7+5HjcE8QNv/ng8++fqyjiPJn9XhElV7jsWaRWBFxUKQA5oj6LMaeD9hHFP0j1deEfEfFfr3g2r+sbS0eKCW7luyJdGDhkjJWrrV6TmyOLA+A+PjzF1Z4nsX28qFLfr5AEWB4uXgeJ635jwcHxMXQAEeeFRmzvO1DWP5Y2Wyp64sT4Ddhg7PgB1VWAz7Dv76e5wz70xUQrAXsualgU5Xb7x4CTDU6Fl33WkyoDa5D/D/uQBOhUd6335uc8d+K4jVQbUrjwiUX+5b3LWpqD87Mi7RuWcoseBEwA9M6MlYGCTLqbn+ycGN/t7adeAvQC2Jw+w2Ff8ttbstO07iVQZUMf5oSBPvj2gkspfmMtVFq7du93oP7+VK7pVrAQgT75dstVXw1Cf+nTZCKOVcF/H89Ec/GFDz1awEoAgVwnCUEVMcDPN+VFU6cjskpY8ePn7gFYL2AzPYhX437AtMsBlFdjxGeAD0GoBrWZbrAG+CjhkW2SArwIO8QFotYBWY2cNeLhr1WSjMKpWOlKdL0ar/wTVRmaXVcBKAOZu/n2nu6ttLhNVU71BrkZBdXHoftP3AsBWBgxPhQtwy4qvBJ7FKnAd1jYwLWoBoHu6MAgg8Ltt30mk2xVGvlJ0zKic65kZta0JABU948RxjFQZUL7x4KQgXwDXLOtZu/LKqVzbype2fSeRbg0YngrLa3v2J+zKaT47/j7AByB+QFU33qerkG+qGheotD/W+yturgtABrPxCYkoH/Re+qjfkTTnvFb6pAfRwnpf0F/iYxLf5PTMjp5Fea/WXRWYUCg70umKLuBDoG2tKz93PVw6dOHYhSduuRMD0Hvx404NoiugL7lW2SRWEPP2fN/4r3FD4iJYPvr1shDtB/nevTbHKFeN0Jc0efiPT2VRpPdS4Yhi3kKdfAzhDpVbGK52rS5djKe9x+PxeDwej8cD/wL9eBGIit64MAAAAABJRU5ErkJggg==',
  psu: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAEj0lEQVR4nO2aS2yUVRTHf+d26lCqGWJIDEEenWk0BoX6KqUPARMR2RkiC5mCGtONaeLGhQtU0ia4JFEXstDSxwqiu1JlAbXvUI1gMJJMX7wSE6O0vGZg5jsumJY6nant95i26fdLmnz3u+c793/PnLn3zukHPj4+Pj4+PssVma1zx5kdgbHCJ3eKmOeAwjxpcgchjsXPw1XNPQia2ywHJV3RLWLMcWCLJwLzhp5T1dqR6tZL2XqzBiA9+QEg6Km2/PGXKUg9H6tou5rZEci88eJgXeE/iXgTDyd/Q4RWVW57LNJVBB5XiAJFwGrLKjgG7Mli919KuqOviZgf080bqaS+MLa9ZcRbud6wsat2qzHSRXr9stRsG61u6p9uY2Y8JbJ58lKhZalOHmC0pmUAaJlsG5OqyLSZEQBBHnt4zd+eqcsfV6auVFZlds7MgGXGsg/AjF1gLpS21wdTq8YbRIkCaxxquCLIsaFrd46w70TKoa95YysD0pP/COeTB1inaENk7cqPXfA1b2xlQPqTR8SqGqps7XUiYGNv7etGpUPROqARINxzoAuotumye7iquWauxnbXgDUATicPMFrZ8kP6cp1TX3awlQFeM59P0CmuByA8WBeSRKJe0b3A0+nblxQ9KcGiL4dfOjbu9phOcHUbjPTUPksifl7RBqCMB+fwIqBMkEYS8fOl3Qc3uTmmU1wLQHiwLqRIB7BBoU/V2hUPriiOB1cUq1q7FPqADZZoR3iwLuTWuE5x7yuQiH8IrAV6C8ZDr8b2fJGY1nt608W3Ou/eKDoDVKZtD+dytRR2gWy8CSDooYzJA3Bx04l7iHwy3XYx4F4GKKUI3LrFQC6T2zet/uJHBSAym6t87gLuZUC67rb6kXjOMtuq4sLJ8XLW6PKNm1+BGMDd4MqtuQzuFyQn+4ZcHNcR7gVA9XsAUW0sba+fUUssba8PikUDgAjfuTauQ1xbA0zAOmqlCt5XqNDQ+E+R3nc+DVimByBprCpLxw8D5cDlgBU4OpuvJbkLxCraJkwqtRthBChXtU7dl+TEfUlOqFqngHKEkZTR3Zeqv7np1rhOcfUoHHul7ffS/v1lVjLwAUb3ojyDohj+AE4WWoGvhucw+SX9WyBW0TYBHEn/LXqWfUnMbgCuwoNihlMBJd3RGgCB60592cFeRQj5WtEGo9IR7jngihAVPe6Ko3liKwOGrt05Isgh4LJTAQLXUT4vCsU/c+rLDvYWwX0nUkMP6neN7srJP/4iuNACFpplHwBba8A8z+pTZ/N8PzcX/Ayw85Dds3q+n5sLyz4D/AAstICFxg9A5g1VnXqnRoWNeVXjBSqrp7UmMrtnBKAAM/UamShvR/oOVnkkzXOe6novjGh0si3or5k2WWv44d4D7ShvpJsJgWZdRKXsObIe2A+k/w8pv6y/N7b17M6zyelGWQMQ6Xx3nQasc6BPeK0yT8QRUz5c2fRbZkfWRXBo+7dXBGszyGnvtXmMcsEIldkmD//zujyKRPqi2xTzMurKC1H5Q+VPDBfWJ8Y6M9Pex8fHx8fHxwfgX3cdh1LA+PA/AAAAAElFTkSuQmCC',
  gabinete: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAEyklEQVR4nO2bTWxUVRTHf+fOVEgQ0ijGQLC2nca4EYJGPqYl08YYozsS4wKHATbGqLBBdxKjmLhUY2jUjaWtusAVC2I0KZR2iohfgY0fdNoKmpCgIFFTyrx7XMy0g5TOvJm5t0PC+yWTvDvvzv/873l3zvvIfRBxeyO1/Kj7aHd8qmlNj4h5CGhy7On/CNNYvs119mcR1L18lbSNpNeJMQeBda7NlEdPqer2ia7Bn1yqVpWA4uBPAktcmqiCiyYWrD+76ePzrgTjYTs+8s1zTZeuTvdRGvxlEQZV+ceRlxU3+1KgWWErsBRYaW3sQ+ApRzHDz4C20fTjIuaLYvNykNeHp1IDE66MtI9mWhbaZy3rTYxDFOuNVbN5sqvvKxdxTeieImtnNxUGXA6+EsbwPTBQagebnGmH7SjI8tI2f7oyUAXn5rZUml2Jhq4B9fLgyczd0zPaAbD0Djn748b+PxYrdjm8J6B1bHsqpvL6TJ4txogBmMljE9nMSCD62mRyYNi3h3KErwE1kMju2GNUhhRSN8QyCimjMpTIZnb79FAJbzMgMZrpUfQdCmeav0F7UQpHW0iBvADcqfBux8jOMxab8+WlHN4SoMIbFAZ/BTFduWTfmet2H2kf2zmI2lFghTV2P8qzvryUw8tfoOP4rnuAJACiB24YPAC5ZN8ZRA8Um8nYtfxdPrxUwksCrMnfX9KWsYV7zu0zQTy+xoeXSngtgpXQQEtXoirO7/TC4CUB8Wv5ScACYOlcqJ+IJIubNi6BsxucavCSgJ97Pr0IkgVAeLFtJD3v1rltJL0O4aVCS7J5MZd8eKmEt7OAFbvPqAwBy0VMNpHd8b61dhjAGJNS1eeBZYBVeLWmJzMO8FYDJpMDwyq6BwgQlim6V4wcFiOHFd2LsAwIgN0TnQeP+/JRCa9FcCI5cAClGxiiMNhZAmAIpTvX2d/r00MlvN8L5Lr6R4HHWo/ubJYl9gFRo3aGXyZ7+i77jh2GRbsbLA7468WKF5aGXgfcCjiZAR1Hdi8Jmv/aL0oaWFWPlsLvRuST/DXbG4tJUPkX9eEkAcXBv+JCS2C1qr4cbzKo1fdcaJbDSQKKRx4R2zmeHCxz7b8wsw9FVTQlSL9V3SbgPQGuasAqgFoHfz2iMgyFmVCvVhhu+yIYJaDRBhpNlIBGG2g0UQIabaDRuErAeYDWse1P1CukNthQ3LpQr1YY3FwJIh8out+ofN6ezdSnFYvNin7mfkHMfJzMgPHf/n1LkH3Ar/Wr6QWg16h5u36tyrh5HvDMoWAc3qTwqYnSAonC00G7GIefqAhGCbjtE+CkBrRnMyNAlwutEnIK1afdas4nmgEuRHKd/Vvq1Zi/TC46CywKUQIabaDRRGcB3wFudaKzwKJEuYWJEtBoA40mSkDYjqo6t15fhVYvbsoakJXXta64kg2dgBhm7hUVUbYlTuxYcP2fB1oQTc/FR39wJVzV6rT2scwRlCeLzasC/QrjTpwoN30LRJDVim5FKL6xIt+1zExtPNZzLO8ibFUJSAzvuk/j9hTovS6C18A0YjbcbPF1rVRVBMdTH50T7FqQL10ZCI1y2ghJl4OHGl+dRZHEifRmxTyK1rcmqHIsuYDhdMvVqWFX0z4iosR/jq+ATu2jUeAAAAAASUVORK5CYII=',
  cooler: 'data:image/png;base64,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',
}} />
  const fallback = { 'Monitor':'🖥','Teclado':'⌨️','Mouse':'🖱','Headset':'🎧','Webcam':'📸',
    'Mousepad':'🖱','Notebook':'💻','Smartphone':'📱','Montagem':'🛠','Instalação SO':'💾',
    'Manutenção':'🔩','Acessório':'🔗','Outro':'📦' }
  return <span style={{ fontSize:size, ...style }}>{fallback[cat]||'📦'}</span>
}

const CATEGORIES = {
  '🖥 Componentes PC': ['Placa-Mãe','Processador','Memória RAM','Placa de Vídeo','Armazenamento','Fonte','Gabinete','Cooler'],
  '🖱 Periféricos': ['Monitor','Teclado','Mouse','Headset','Webcam','Mousepad'],
  '💻 Portáteis': ['Notebook','Smartphone'],
  '🔧 Serviços': ['Montagem','Instalação SO','Manutenção'],
  '📦 Outros': ['Acessório','Outro'],
}

const STEPS = [
  { key: 'Placa-Mãe',     label: 'Placa-Mãe',      sub: 'Base do setup — define compatibilidade', required: true  },
  { key: 'Processador',   label: 'Processador',     sub: 'O cérebro do computador',                required: true  },
  { key: 'Memória RAM',   label: 'Memória RAM',     sub: 'Velocidade e multitarefa',               required: true  },
  { key: 'Placa de Vídeo',label: 'Placa de Vídeo',  sub: 'Games, design e renderização',           required: false },
  { key: 'Armazenamento', label: 'Armazenamento',   sub: 'SSD ou HD — rápido e capacidade',        required: true  },
  { key: 'Fonte',         label: 'Fonte',            sub: 'Alimente tudo com segurança',            required: true  },
  { key: 'Gabinete',      label: 'Gabinete',         sub: 'Visual e ventilação do setup',           required: false },
  { key: 'Cooler',        label: 'Cooler',           sub: 'Temperaturas sob controle',              required: false },
  { key: 'Monitor',       label: 'Monitor',          sub: 'A janela do setup',                      required: false },
  { key: 'Teclado',       label: 'Teclado',          sub: 'Periférico de entrada',                  required: false },
  { key: 'Mouse',         label: 'Mouse',            sub: 'Precisão nos movimentos',                required: false },
  { key: 'Headset',       label: 'Headset',          sub: 'Áudio imersivo',                         required: false },
  { key: 'Montagem',      label: 'Montagem',         sub: 'Montagem profissional Easy Tech',        required: false },
]

// ─── Componente principal ─────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState('builder')
  const [catalog, setCatalog] = useState([])
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState({ text: 'Carregando…', color: '#f59e0b' })
  const [toast, setToast] = useState('')
  const nextId = useRef(1)

  // ── Builder state
  const [step, setStep] = useState(0)
  const [cart, setCart] = useState({})
  const [search, setSearch] = useState('')
  const [avNome, setAvNome] = useState('')
  const [avPreco, setAvPreco] = useState('')
  const [discPct, setDiscPct] = useState('')
  const [discVal, setDiscVal] = useState('')
  const [cli, setCli] = useState({ nome: '', tel: '', email: '', obs: '' })

  // ── Catalog form state
  const [form, setForm] = useState({ nome:'', cat:'Placa-Mãe', marca:'', desc:'', stock:'1', custo:'', preco:'' })

  // ── Modal de edição
  const [editModal, setEditModal] = useState(null) // produto sendo editado ou null
  const [editForm, setEditForm] = useState({})

  const openEdit = (p) => {
    setEditForm({ nome:p.nome, cat:p.cat, marca:p.marca||'', desc:p.desc||'', stock:String(p.stock||0), custo:String(p.custo||''), preco:String(p.preco) })
    setEditModal(p)
  }

  const saveEdit = async () => {
    if (!editForm.nome || !editForm.preco) { showToast('⚠️ Nome e preço são obrigatórios'); return }
    const preco = parseFloat(editForm.preco)
    const updated = { ...editModal, ...editForm, preco, prazo: prazoPreco(preco), custo: parseFloat(editForm.custo)||0, stock: parseInt(editForm.stock)||0 }
    setCatalog(c => c.map(p => p.id === updated.id ? updated : p))
    setEditModal(null)
    showToast('✅ Produto atualizado!')
    setSync('syncing')
    try {
      await fetch('/api/produtos', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(updated) })
      setSync('ok', `${updated.nome} salvo`)
    } catch { setSync('error','Erro ao salvar') }
  }

  // ── Toast
  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  // ── Sync status
  const setSync = useCallback((text, color = '#22c55e') => setSyncMsg({ text, color }), [])

  // ── API calls ─────────────────────────────────────────────
  const loadCatalog = useCallback(async () => {
    setSyncing(true)
    setSync('Carregando…', '#f59e0b')
    try {
      const res = await fetch('/api/produtos')
      const data = await res.json()
      if (Array.isArray(data)) {
        const normalized = data.map(p => ({ ...p, prazo: p.prazo || prazoPreco(p.preco) }))
        setCatalog(normalized)
        const maxId = normalized.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0)
        nextId.current = maxId + 1
        setSync(`${normalized.length} produtos`, '#22c55e')
      }
    } catch {
      setSync('Erro de conexão', '#ef4444')
    } finally {
      setSyncing(false)
    }
  }, [setSync])

  useEffect(() => { loadCatalog() }, [loadCatalog])

  const apiAddProduct = async (produto) => {
    try {
      await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto),
      })
      setSync(`Salvo: ${produto.nome}`, '#22c55e')
    } catch {
      setSync('Erro ao salvar', '#ef4444')
    }
  }

  const apiDeleteProduct = async (id) => {
    try {
      await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
      setSync('Removido', '#22c55e')
    } catch {
      setSync('Erro ao remover', '#ef4444')
    }
  }

  // ── Catalog actions ───────────────────────────────────────
  const addProduct = async () => {
    if (!form.nome.trim() || !form.preco) {
      showToast('⚠️ Nome e preço à vista são obrigatórios')
      return
    }
    const preco = parseFloat(form.preco)
    const produto = {
      id: nextId.current++,
      nome: form.nome.trim(),
      cat: form.cat,
      marca: form.marca.trim(),
      desc: form.desc.trim(),
      stock: parseInt(form.stock) || 0,
      custo: parseFloat(form.custo) || 0,
      preco,
      prazo: prazoPreco(preco),
    }
    setCatalog(c => [...c, produto])
    setForm(f => ({ ...f, nome: '', marca: '', desc: '', stock: '1', custo: '', preco: '' }))
    showToast(`✅ ${produto.nome} adicionado!`)
    await apiAddProduct(produto)
  }

  const deleteProduct = async (id) => {
    const p = catalog.find(c => c.id === id)
    setCatalog(c => c.filter(x => x.id !== id))
    showToast('🗑 Removido')
    await apiDeleteProduct(id)
  }

  // ── Builder actions ───────────────────────────────────────
  const selectProd = (prodId) => {
    const s = STEPS[step]
    const prod = catalog.find(p => p.id === prodId)
    if (!prod) return
    setCart(c => {
      const nc = { ...c }
      if (nc[s.key]?.prodId === prodId) delete nc[s.key]
      else nc[s.key] = {
        prodId, nome: prod.nome, preco: prod.preco,
        prazo: prod.prazo || prazoPreco(prod.preco),
        desc: prod.desc, marca: prod.marca, cat: s.key, avulso: false,
      }
      return nc
    })
    setSearch('')
  }

  const addAvulso = () => {
    if (!avNome.trim() || !avPreco) { showToast('⚠️ Preencha nome e valor'); return }
    const preco = parseFloat(avPreco)
    const s = STEPS[step]
    setCart(c => ({ ...c, [s.key]: { prodId: null, nome: avNome.trim(), preco, prazo: prazoPreco(preco), desc: '', marca: '', cat: s.label, avulso: true } }))
    setAvNome(''); setAvPreco('')
    showToast(`✅ ${avNome} adicionado`)
  }

  const removeCart = (key) => setCart(c => { const nc = { ...c }; delete nc[key]; return nc })

  // ── Totais ────────────────────────────────────────────────
  const cartItems = STEPS.filter(s => cart[s.key]).map(s => ({ ...cart[s.key], stepLabel: s.label, icon: s.icon }))
  const subtotal = cartItems.reduce((a, c) => a + c.preco, 0)
  const subtotalPrazo = cartItems.reduce((a, c) => a + (c.prazo || prazoPreco(c.preco)), 0)
  const desconto = Math.max(parseFloat(discVal) || 0, subtotal * (parseFloat(discPct) || 0) / 100)
  const total = Math.max(0, subtotal - desconto)
  const totalPrazo = Math.max(0, subtotalPrazo - desconto * (1 + TAXA_PRAZO))

  // ── Progress ──────────────────────────────────────────────
  const done = STEPS.filter(s => cart[s.key]).length
  const progPct = Math.round((done / STEPS.length) * 100)

  // ── Produtos do step atual ────────────────────────────────
  const stepProds = catalog.filter(p =>
    p.cat === STEPS[step].key &&
    (p.nome?.toLowerCase().includes(search.toLowerCase()) ||
     (p.marca || '').toLowerCase().includes(search.toLowerCase()) ||
     (p.desc || '').toLowerCase().includes(search.toLowerCase()))
  )

  // ── PDF — layout dark (jsPDF) ─────────────────────────────
  const exportPDF = async () => {
    if (!cartItems.length) { showToast('Adicione itens ao orcamento'); return }

    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        s.onload = resolve; s.onerror = reject
        document.head.appendChild(s)
      })
    }

    const { jsPDF } = window.jspdf
    // jsPDF: Y=0 no TOPO, cresce para baixo
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const W = 595, H = 842, M = 28

    // helpers — cores 0-255
    const rgb  = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]
    const fill = (h) => { const [r,g,b]=rgb(h); doc.setFillColor(r,g,b) }
    const clr  = (h) => { const [r,g,b]=rgb(h); doc.setTextColor(r,g,b) }
    const strk = (h) => { const [r,g,b]=rgb(h); doc.setDrawColor(r,g,b) }
    const box  = (x,y,w,h) => doc.rect(x,y,w,h,'F')
    const rbox = (x,y,w,h,r) => doc.roundedRect(x,y,w,h,r,r,'F')
    const txt  = (t,x,y) => doc.text(String(t),x,y)
    const safe = (s) => (s||'').replace(/[^ -~À-ÿ]/g,'').trim()

    // Carrega logo
    let logoB64 = null
    try {
      const res = await fetch('/logo.png')
      const blob = await res.blob()
      logoB64 = await new Promise(r => { const rd=new FileReader(); rd.onload=e=>r(e.target.result); rd.readAsDataURL(blob) })
    } catch {}

    // Mapa de ícones para o PDF (já em base64 no CAT_ICON_B64)
    const pdfCatIcon = (cat) => CAT_ICONS[cat] || null

    // BG
    fill('#0D0D0D'); box(0, 0, W, H)

    // HEADER Y:0..110 (topo)
    const HDR_H = 110
    fill('#1A1A1A'); box(0, 0, W, HDR_H)
    fill('#22C55E'); box(0, HDR_H - 3, W, 3)

    if (logoB64) doc.addImage(logoB64, 'PNG', M, 14, 82, 82)

    doc.setFont('helvetica','bold'); doc.setFontSize(30); clr('#22C55E')
    let cx = M + 100
    for (const ch of 'EASYTECH') { txt(ch, cx, 62); cx += doc.getTextWidth(ch) + 3 }
    doc.setFont('helvetica','normal'); doc.setFontSize(8); clr('#555555')
    txt('S T O R E', M + 100, 78)

    const nowDate = new Date()
    doc.setFontSize(9); clr('#A0A0A0')
    const dateStr = fmtDate(nowDate)
    txt(dateStr, W - M - doc.getTextWidth(dateStr), 22)

    // CLIENTE Y:114..178
    const CLI_Y = HDR_H + 4, CLI_H = 64
    fill('#222222'); box(0, CLI_Y, W, CLI_H)
    fill('#2A2A2A'); box(0, CLI_Y, W, 1); box(0, CLI_Y + CLI_H - 1, W, 1)

    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); clr('#555555')
    txt('CLIENTE', M, CLI_Y + 18); txt('TELEFONE', W/2, CLI_Y + 18)
    doc.setFont('helvetica','bold'); doc.setFontSize(13); clr('#F0F0F0')
    txt(safe(cli.nome) || 'CLIENTE', M, CLI_Y + 42)
    txt(safe(cli.tel)  || '-',       W/2, CLI_Y + 42)

    // LABEL DESCRICAO
    const LBL_Y = CLI_Y + CLI_H + 22
    doc.setFont('helvetica','bold'); doc.setFontSize(10); clr('#22C55E')
    txt('DESCRICAO DO PRODUTO', M, LBL_Y)
    fill('#22C55E'); box(M, LBL_Y + 4, 162, 1.5)

    // BOX ITENS
    const ITEM_ROW_H = 36
    const BOX_H = 16 + cartItems.length * ITEM_ROW_H + 10
    const BOX_Y = LBL_Y + 12
    fill('#1E1E1E'); strk('#2A2A2A'); doc.setLineWidth(1)
    doc.roundedRect(M, BOX_Y, W - 2*M, BOX_H, 5, 5, 'FD')

    let iy = BOX_Y + 24
    cartItems.forEach((item, i) => {
      // Ícone PNG da categoria no PDF
      const catIcon = pdfCatIcon(item.cat)
      if (catIcon) {
        try { doc.addImage(catIcon, 'PNG', M + 12, iy - 22, 14, 14) } catch {}
        doc.setFont('helvetica','bold'); doc.setFontSize(8); clr('#22C55E')
        txt(item.stepLabel.toUpperCase(), M + 30, iy - 10)
      } else {
        doc.setFont('helvetica','bold'); doc.setFontSize(8); clr('#22C55E')
        txt(item.stepLabel.toUpperCase(), M + 12, iy - 10)
      }
      doc.setFont('helvetica','bold'); doc.setFontSize(10); clr('#F0F0F0')
      const nomeTxt = safe(item.nome) + (item.marca ? ' - ' + safe(item.marca) : '')
      txt(nomeTxt, M + 12, iy)
      const prazo = item.prazo || prazoPreco(item.preco)
      clr('#22C55E'); doc.setFontSize(10)
      const pStr = fmtBRL(item.preco)
      txt(pStr, W - M - 12 - doc.getTextWidth(pStr), iy)
      clr('#A0A0A0'); doc.setFont('helvetica','normal'); doc.setFontSize(8)
      const iStr = '12x ' + fmtBRL(prazo/12)
      txt(iStr, W - M - 12 - doc.getTextWidth(iStr), iy + 13)
      if (i < cartItems.length - 1) { fill('#2A2A2A'); box(M + 12, iy + 20, W - 2*M - 24, 0.5) }
      iy += ITEM_ROW_H
    })

    // TOTAIS
    let totY = BOX_Y + BOX_H + 16
    if (desconto > 0) {
      doc.setFont('helvetica','normal'); doc.setFontSize(9); clr('#A0A0A0')
      txt('Subtotal', M, totY)
      txt(fmtBRL(subtotal), W - M - doc.getTextWidth(fmtBRL(subtotal)), totY)
      totY += 16; clr('#22C55E')
      txt('Desconto', M, totY)
      const dStr = '- ' + fmtBRL(desconto)
      txt(dStr, W - M - doc.getTextWidth(dStr), totY)
      totY += 16
    }

    doc.setFont('helvetica','normal'); doc.setFontSize(9); clr('#A0A0A0')
    const instTotal = 'ou 12x de ' + fmtBRL(totalPrazo/12) + ' (total ' + fmtBRL(totalPrazo) + ')'
    txt(instTotal, W/2 - doc.getTextWidth(instTotal)/2, totY + 14)

    if (cli.obs) { clr('#555555'); doc.setFontSize(8); txt('Obs: ' + safe(cli.obs), M, totY + 28) }

    // BARRA VERDE VALOR TOTAL
    const VAL_Y = totY + 24, VAL_H = 54
    fill('#22C55E'); rbox(M, VAL_Y, W - 2*M, VAL_H, 27)
    doc.setFont('helvetica','bold'); doc.setFontSize(11); clr('#000000')
    txt('VALOR A VISTA', M + 26, VAL_Y + VAL_H/2 + 4)
    doc.setFontSize(18)
    const vs = fmtBRL(total)
    txt(vs, W - M - doc.getTextWidth(vs) - 26, VAL_Y + VAL_H/2 + 6)

    // FOOTER Y: H-72..H (base)
    const FTR_H = 72, FTR_Y = H - FTR_H
    fill('#1A1A1A'); box(0, FTR_Y, W, FTR_H)
    fill('#22C55E'); box(0, FTR_Y, W, 2)

    if (logoB64) doc.addImage(logoB64, 'PNG', M, FTR_Y + 12, 44, 44)

    doc.setFont('helvetica','bold'); doc.setFontSize(9); clr('#F0F0F0')
    txt('EASYTECH STORE', M + 54, FTR_Y + 26)
    doc.setFontSize(8); clr('#22C55E')
    txt('INSTAGRAM: @EASYTECHSTORERS', M + 54, FTR_Y + 38)
    txt('WHATSAPP: (54) 99137-0566',   M + 54, FTR_Y + 49)
    txt('WWW.EASYTECHSTORE.COM.BR',     M + 54, FTR_Y + 60)

    const validDate = new Date(nowDate); validDate.setDate(validDate.getDate() + 7)
    doc.setFont('helvetica','normal'); doc.setFontSize(8); clr('#A0A0A0')
    const vLabel = 'VALIDADE DO ORCAMENTO: ' + fmtDate(validDate)
    txt(vLabel, W - M - doc.getTextWidth(vLabel), FTR_Y + 36)
    const numOrcPDF = 'ORC-' + nowDate.getFullYear() + pad(nowDate.getMonth()+1) + pad(nowDate.getDate()) + '-' + String(Math.floor(Math.random()*1000)).padStart(3,'0')
    clr('#555555'); doc.setFontSize(7)
    txt(numOrcPDF, W - M - doc.getTextWidth(numOrcPDF), FTR_Y + 48)

    doc.save('Orcamento_EasyTech_' + (cli.nome ? cli.nome.replace(/\s+/g,'_') : 'cliente') + '.pdf')
    showToast('PDF gerado!')
  }

  const now = new Date()
  const valid = new Date(now); valid.setDate(valid.getDate() + 7)
  const numOrc = `ORC-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Easy Tech — Monte seu PC</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>

      {/* Toast */}
      <div style={{ position:'fixed', bottom:24, left:'50%', transform:`translateX(-50%) translateY(${toast?'0':'8px'})`, background:'var(--surface)', border:'1px solid var(--border2)', color:'var(--text)', padding:'10px 20px', borderRadius:50, fontSize:13, fontWeight:500, boxShadow:'0 8px 32px rgba(0,0,0,.6)', zIndex:999, opacity:toast?1:0, transition:'all .25s', pointerEvents:'none', whiteSpace:'nowrap' }}>
        {toast}
      </div>

      {/* ══ HEADER ══ */}
      <header className="no-print" style={{ height:60, background:'var(--surface)', borderBottom:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 20px rgba(0,0,0,.5)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src="/logo.png" alt="Easy Tech" style={{ height:36, objectFit:'contain' }} onError={e => e.target.style.display='none'} />
          <span style={{ fontWeight:800, fontSize:16 }}>Easy<span style={{ color:'var(--green)' }}>Tech</span></span>
        </div>

        <div style={{ display:'flex', gap:4, background:'var(--bg)', borderRadius:10, padding:4, border:'1px solid var(--border)' }}>
          {[['builder','🖥 Monte seu PC'],['catalog','📦 Catálogo']].map(([p, label]) => (
            <button key={p} onClick={() => setTab(p)}
              style={{ padding:'6px 18px', border:'none', borderRadius:7, fontSize:13, fontWeight:500, cursor:'pointer', background:tab===p?'var(--surface2)':'transparent', color:tab===p?'var(--green)':'var(--text2)', transition:'all .18s' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:11, color:syncMsg.color, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:syncMsg.color, display:'inline-block', boxShadow:`0 0 6px ${syncMsg.color}` }} />
            {syncMsg.text}
          </span>
          <button onClick={loadCatalog} disabled={syncing}
            style={{ background:'none', border:'1px solid var(--border2)', borderRadius:7, color:'var(--text2)', fontSize:12, padding:'5px 10px', cursor:'pointer' }}>
            {syncing ? '…' : '↻ Sync'}
          </button>
        </div>
      </header>

      {/* ══ BUILDER ══ */}
      {tab === 'builder' && (
        <div className="no-print" style={{ display:'grid', gridTemplateColumns:'260px 1fr 320px', minHeight:'calc(100vh - 60px)' }}>

          {/* ── Sidebar ── */}
          <aside style={{ background:'var(--surface)', borderRight:'1px solid var(--border)', position:'sticky', top:60, height:'calc(100vh - 60px)', overflowY:'auto' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text3)', marginBottom:6 }}>
                <span>Progresso</span>
                <span style={{ color:'var(--green)', fontWeight:600 }}>{progPct}%</span>
              </div>
              <div style={{ height:4, background:'var(--surface3)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progPct}%`, background:'var(--green)', borderRadius:2, transition:'width .4s', boxShadow:'0 0 8px rgba(34,197,94,.3)' }} />
              </div>
            </div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--text3)', padding:'0 18px 10px' }}>Componentes</div>
            {STEPS.map((s, i) => {
              const isActive = i === step
              const isDone = !!cart[s.key]
              return (
                <div key={s.key} onClick={() => { setStep(i); setSearch('') }}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 18px', cursor:'pointer', borderLeft:`3px solid ${isActive?'var(--green)':'transparent'}`, background:isActive?'var(--green-dark)':isDone?'rgba(34,197,94,.04)':'transparent', transition:'all .15s' }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', border:`2px solid ${isActive?'var(--green)':isDone?'var(--green-dim)':'var(--border2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0, color:isActive?'#000':isDone?'var(--green)':'var(--text3)', background:isActive?'var(--green)':isDone?'var(--green-dark)':'transparent', transition:'all .18s' }}>
                    {isDone && !isActive ? '✓' : i + 1}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:isActive?'var(--green)':isDone?'var(--text)':'var(--text2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      <CatIcon cat={s.key} size={14} style={{marginRight:4}}/>{s.label}{!s.required && <span style={{ fontSize:9, opacity:.4 }}> opc.</span>}
                    </div>
                    {cart[s.key] && (
                      <div style={{ fontSize:10, color:'var(--green)', opacity:.8, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:1 }}>
                        {cart[s.key].nome.length > 22 ? cart[s.key].nome.slice(0,22)+'…' : cart[s.key].nome}
                      </div>
                    )}
                  </div>
                  {isDone && <span style={{ color:'var(--green)', fontSize:12, flexShrink:0 }}>✓</span>}
                </div>
              )
            })}
          </aside>

          {/* ── Main ── */}
          <main style={{ padding:28, overflowY:'auto' }}>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--green)', marginBottom:6 }}>
                Passo {step+1} de {STEPS.length}
              </div>
              <div style={{ fontSize:24, fontWeight:800, letterSpacing:'-.5px' }}>{STEPS[step].label}</div>
              <div style={{ fontSize:13, color:'var(--text2)', marginTop:6 }}>{STEPS[step].sub}</div>
            </div>

            {/* Search */}
            <div style={{ position:'relative', marginBottom:16 }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', pointerEvents:'none' }}>🔎</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto…"
                style={{ width:'100%', padding:'10px 14px 10px 36px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }}
                onFocus={e => e.target.style.borderColor='var(--green)'}
                onBlur={e => e.target.style.borderColor='var(--border2)'} />
            </div>

            {/* Grid */}
            {!stepProds.length ? (
              <div style={{ textAlign:'center', padding:'48px 24px', color:'var(--text3)', border:'1px dashed var(--border2)', borderRadius:'var(--radius-lg)' }}>
                <div style={{ fontSize:36, marginBottom:10 }}>{STEPS[step].icon}</div>
                <div style={{ fontSize:14, marginBottom:8 }}>Nenhum <strong>{STEPS[step].label}</strong> no catálogo</div>
                <div style={{ fontSize:12 }}>
                  <span style={{ color:'var(--green)', cursor:'pointer' }} onClick={() => setTab('catalog')}>Cadastre na aba Catálogo</span>
                  {' '}ou adicione um item avulso abaixo.
                </div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:12, marginBottom:24 }}>
                {stepProds.map(p => {
                  const isSel = cart[STEPS[step].key]?.prodId === p.id
                  const outOfStock = p.stock !== undefined && p.stock <= 0
                  return (
                    <div key={p.id}
                      onClick={() => !outOfStock && selectProd(p.id)}
                      style={{ background:isSel?'var(--green-dark)':'var(--surface)', border:`1px solid ${isSel?'var(--green)':'var(--border)'}`, borderRadius:'var(--radius-lg)', padding:14, cursor:outOfStock?'not-allowed':'pointer', opacity:outOfStock?.4:1, position:'relative', transition:'all .2s' }}>
                      {isSel && <div style={{ position:'absolute', top:10, right:10, background:'var(--green)', color:'#000', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800 }}>✓</div>}
                      <CatIcon cat={p.cat} size={28} style={{ display:'block', marginBottom:8 }} />
                      {p.marca && <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, color:'var(--text3)', marginBottom:4 }}>{p.marca}</div>}
                      <div style={{ fontSize:13, fontWeight:600, lineHeight:1.3, marginBottom:4 }}>{p.nome}</div>
                      {p.desc && <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8, lineHeight:1.4 }}>{p.desc}</div>}
                      <div style={{ fontFamily:'DM Mono, monospace', fontSize:13, fontWeight:600, color:'var(--green)' }}>
                        {fmtBRL(p.preco)} <span style={{ fontSize:10, color:'var(--text3)', fontWeight:400 }}>à vista</span>
                      </div>
                      <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>
                        ou 12x de {fmtBRL((p.prazo || prazoPreco(p.preco)) / 12)}
                      </div>
                      {p.stock !== undefined && (
                        <div style={{ fontSize:10, marginTop:4, fontWeight:700, color:p.stock<=0?'var(--red)':p.stock<=3?'var(--amber)':'var(--text3)' }}>
                          {p.stock<=0 ? '⚠️ Sem estoque' : p.stock<=3 ? `⚡ ${p.stock} un.` : `✓ ${p.stock} un.`}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Avulso */}
            <div style={{ border:'1px dashed var(--border2)', borderRadius:'var(--radius-lg)', padding:18, marginTop:4 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:.6, color:'var(--text3)', marginBottom:12 }}>✏️ Item fora do catálogo</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>Descrição</label>
                  <input value={avNome} onChange={e => setAvNome(e.target.value)} placeholder="Nome do produto"
                    style={{ width:'100%', padding:'9px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>Valor à vista (R$)</label>
                  <input type="number" value={avPreco} onChange={e => setAvPreco(e.target.value)} placeholder="0,00"
                    style={{ width:'100%', padding:'9px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }} />
                </div>
              </div>
              <button onClick={addAvulso}
                style={{ background:'transparent', border:'1px solid var(--border2)', borderRadius:'var(--radius)', color:'var(--text2)', fontSize:13, fontWeight:600, padding:'9px 18px', cursor:'pointer' }}>
                ➕ Adicionar avulso
              </button>
            </div>

            {/* Nav */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:24, paddingTop:18, borderTop:'1px solid var(--border)' }}>
              <button onClick={() => { if(step>0){ setStep(s=>s-1); setSearch('') } }} disabled={step===0}
                style={{ padding:'9px 18px', border:'1px solid var(--border2)', borderRadius:'var(--radius)', background:'transparent', color:'var(--text2)', fontSize:13, fontWeight:600, cursor:step===0?'not-allowed':'pointer', opacity:step===0?.3:1 }}>
                ← Anterior
              </button>
              <span style={{ fontSize:12, color:'var(--text3)' }}>{STEPS[step].required ? '⚠️ Obrigatório' : 'Opcional — pode pular'}</span>
              <button onClick={() => { if(step<STEPS.length-1){ setStep(s=>s+1); setSearch('') } else showToast('🎉 Configuração concluída!') }}
                style={{ padding:'9px 22px', border:'none', borderRadius:'var(--radius)', background:'var(--green)', color:'#000', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                {step === STEPS.length-1 ? '✅ Finalizar' : 'Próximo →'}
              </button>
            </div>
          </main>

          {/* ── Cart Panel ── */}
          <aside style={{ background:'var(--surface)', borderLeft:'1px solid var(--border)', position:'sticky', top:60, height:'calc(100vh - 60px)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:16, borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              <div style={{ fontWeight:800, fontSize:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                Resumo <span style={{ fontSize:12, fontWeight:500, color:'var(--text3)' }}>{cartItems.length} itens</span>
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Itens do orçamento</div>
            </div>

            <div style={{ flex:1, overflowY:'auto' }}>
              {!cartItems.length ? (
                <div style={{ padding:'40px 16px', textAlign:'center', color:'var(--text3)', fontSize:13 }}>
                  Selecione componentes para montar o orçamento.
                </div>
              ) : cartItems.map(item => {
                const s = STEPS.find(s => s.key === item.cat) || {}
                return (
                  <div key={item.cat} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 14px', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'var(--green)', marginBottom:1 }}>
                        <CatIcon cat={item.cat} size={12} style={{marginRight:3}}/>{item.stepLabel}
                      </div>
                      <div style={{ fontSize:12, fontWeight:600, lineHeight:1.3 }}>
                        {item.nome}{item.avulso && <em style={{ fontSize:10, opacity:.5 }}> avulso</em>}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text2)' }}>{fmtBRL(item.preco)}</div>
                      <div style={{ fontSize:10, color:'var(--amber)' }}>{fmtBRL((item.prazo||prazoPreco(item.preco))/12)}/x</div>
                    </div>
                    <button onClick={() => removeCart(item.cat)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:13, padding:2, lineHeight:1 }}>✕</button>
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop:'1px solid var(--border2)', padding:14, flexShrink:0 }}>
              {/* Desconto */}
              <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600 }}>Desc.%</span>
                <input type="number" value={discPct} onChange={e=>setDiscPct(e.target.value)} placeholder="0"
                  style={{ width:60, background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:7, padding:'5px 8px', fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text)', outline:'none' }} />
                <span style={{ fontSize:11, color:'var(--text3)', fontWeight:600 }}>R$</span>
                <input type="number" value={discVal} onChange={e=>setDiscVal(e.target.value)} placeholder="0"
                  style={{ width:70, background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:7, padding:'5px 8px', fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--text)', outline:'none' }} />
              </div>

              {/* Totais */}
              {cartItems.length > 0 && <>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text2)', marginBottom:4 }}>
                  <span>Subtotal</span><span style={{ fontFamily:'DM Mono,monospace' }}>{fmtBRL(subtotal)}</span>
                </div>
                {desconto > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--green)', marginBottom:4 }}>
                    <span>Desconto</span><span style={{ fontFamily:'DM Mono,monospace' }}>− {fmtBRL(desconto)}</span>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                  <span>Total à vista</span>
                  <span style={{ fontFamily:'DM Mono,monospace', color:'var(--green)' }}>{fmtBRL(total)}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--amber)', textAlign:'right', marginTop:4, fontStyle:'italic' }}>
                  ou 12x de {fmtBRL(totalPrazo/12)} (total {fmtBRL(totalPrazo)})
                </div>
              </>}

              {/* Dados do cliente */}
              <div style={{ display:'flex', flexDirection:'column', gap:7, margin:'12px 0' }}>
                {[['nome','👤 Nome do cliente'],['tel','📱 WhatsApp'],['email','✉️ E-mail']].map(([k,ph]) => (
                  <input key={k} placeholder={ph} value={cli[k]} onChange={e => setCli(c=>({...c,[k]:e.target.value}))}
                    style={{ width:'100%', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:7, padding:'7px 10px', fontSize:12, color:'var(--text)', outline:'none' }} />
                ))}
                <textarea placeholder="📝 Observações…" value={cli.obs} onChange={e => setCli(c=>({...c,obs:e.target.value}))}
                  style={{ width:'100%', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:7, padding:'7px 10px', fontSize:12, color:'var(--text)', outline:'none', resize:'vertical', minHeight:48 }} />
              </div>

              <button onClick={exportPDF}
                style={{ width:'100%', background:'var(--green)', border:'none', borderRadius:'var(--radius)', color:'#000', fontSize:13, fontWeight:700, padding:'10px', cursor:'pointer' }}>
                📄 Gerar PDF
              </button>
              <div style={{ fontSize:10, color:'var(--text3)', textAlign:'center', marginTop:6 }}>Validade: 7 dias</div>
            </div>
          </aside>
        </div>
      )}

      {/* ══ CATALOG ══ */}
      {tab === 'catalog' && (
        <div className="no-print" style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px', display:'grid', gridTemplateColumns:'360px 1fr', gap:24, alignItems:'start' }}>

          {/* Form */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:7, background:'var(--green-dark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>➕</div>
              <span style={{ fontSize:13, fontWeight:700 }}>Cadastrar Produto</span>
            </div>
            <div style={{ padding:20 }}>
              {/* Categoria */}
              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>Categoria</label>
                <select value={form.cat} onChange={e => setForm(f=>({...f,cat:e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }}>
                  {Object.entries(CATEGORIES).map(([grp,cats]) => (
                    <optgroup key={grp} label={grp}>
                      {cats.map(c => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Nome */}
              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>Nome *</label>
                <input value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: RTX 5060 8GB"
                  style={{ width:'100%', padding:'9px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }} />
              </div>

              {/* Marca + Especificações */}
              {[['marca','Marca','Ex: NVIDIA, ASUS…'],['desc','Especificações','Ex: 8GB GDDR7, PCIe 5.0…']].map(([k,lbl,ph]) => (
                <div key={k} style={{ marginBottom:13 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>{lbl}</label>
                  <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                    style={{ width:'100%', padding:'9px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }} />
                </div>
              ))}

              {/* Estoque + Custo + Preço */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:13 }}>
                {[['stock','Estoque','1','number'],['custo','Custo (R$)','0,00','number'],['preco','À Vista (R$) *','0,00','number']].map(([k,lbl,ph,type]) => (
                  <div key={k}>
                    <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.4, marginBottom:5 }}>{lbl}</label>
                    <input type={type} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}
                      style={{ width:'100%', padding:'9px 10px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }} />
                  </div>
                ))}
              </div>

              {/* Preview prazo */}
              {form.preco && (
                <div style={{ fontSize:11, color:'var(--green)', marginBottom:12, padding:'8px 12px', background:'var(--green-dark)', borderRadius:7 }}>
                  À vista: <strong>{fmtBRL(parseFloat(form.preco)||0)}</strong> &nbsp;·&nbsp;
                  12x de <strong>{fmtBRL(prazoPreco(parseFloat(form.preco)||0)/12)}</strong> (+10%)
                </div>
              )}

              <button onClick={addProduct}
                style={{ width:'100%', background:'var(--green)', border:'none', borderRadius:'var(--radius)', color:'#000', fontSize:13, fontWeight:700, padding:'10px', cursor:'pointer' }}>
                ➕ Adicionar ao Catálogo
              </button>
            </div>
          </div>

          {/* Tabela */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:7, background:'var(--green-dark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>📋</div>
                <span style={{ fontSize:13, fontWeight:700 }}>Produtos Cadastrados</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, color:'var(--text3)' }}>{catalog.length} itens</span>
                <span style={{ width:1, height:14, background:'var(--border2)' }} />
                <span style={{ fontSize:11, color:syncMsg.color }}>{syncMsg.text}</span>
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>
                    {['Produto','Categoria','Estoque','Custo','À Vista','12x (+10%)','Margem',''].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'10px 14px', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.6, color:'var(--text3)', borderBottom:'1px solid var(--border)', background:'var(--surface2)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!catalog.length ? (
                    <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>Nenhum produto cadastrado</td></tr>
                  ) : catalog.map((p, i) => {
                    const prazo = p.prazo || prazoPreco(p.preco)
                    const margem = p.custo > 0 ? Math.round(((p.preco - p.custo) / p.preco) * 100) : null
                    const margemColor = margem === null ? 'var(--text3)' : margem >= 30 ? 'var(--green)' : margem >= 15 ? 'var(--amber)' : 'var(--red)'
                    const stockColor = !p.stock ? 'var(--red)' : p.stock <= 3 ? 'var(--amber)' : 'var(--green)'
                    return (
                      <tr key={p.id} style={{ background:i%2===0?'transparent':'rgba(255,255,255,.02)' }}>
                        <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}>
                          <div style={{ fontWeight:600 }}><CatIcon cat={p.cat} size={16} style={{marginRight:6,verticalAlign:'middle'}}/>{p.nome}</div>
                          {p.marca && <div style={{ fontSize:11, color:'var(--text3)' }}>{p.marca}</div>}
                          {p.desc  && <div style={{ fontSize:11, color:'var(--text3)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.desc}</div>}
                        </td>
                        <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}>
                          <span style={{ display:'inline-block', padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:600, background:'var(--green-dark)', color:'var(--green)' }}>{p.cat}</span>
                        </td>
                        <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', fontWeight:700, color:stockColor }}>{p.stock ?? '—'} un</td>
                        <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', fontFamily:'DM Mono,monospace', color:'var(--text3)' }}>{p.custo > 0 ? fmtBRL(p.custo) : '—'}</td>
                        <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', fontFamily:'DM Mono,monospace', color:'var(--green)', fontWeight:700 }}>{fmtBRL(p.preco)}</td>
                        <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', fontFamily:'DM Mono,monospace', color:'var(--amber)', fontSize:12 }}>{fmtBRL(prazo/12)}/x</td>
                        <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', fontWeight:700, color:margemColor }}>{margem !== null ? `${margem}%` : '—'}</td>
                        <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => openEdit(p)}
                              style={{ background:'transparent', border:'1px solid rgba(34,197,94,.2)', borderRadius:7, color:'var(--green)', fontSize:12, padding:'4px 10px', cursor:'pointer' }}>✏️</button>
                            <button onClick={() => deleteProduct(p.id)}
                              style={{ background:'transparent', border:'1px solid rgba(239,68,68,.2)', borderRadius:7, color:'var(--red)', fontSize:12, padding:'4px 10px', cursor:'pointer' }}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL EDIÇÃO ══ */}
      {editModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:16, padding:28, width:520, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>✏️ Editar Produto</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginBottom:20 }}>{editModal.nome}</div>

            {/* Categoria */}
            <div style={{ marginBottom:13 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>Categoria</label>
              <select value={editForm.cat} onChange={e=>setEditForm(f=>({...f,cat:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }}>
                {Object.entries(CATEGORIES).map(([grp,cats]) => (
                  <optgroup key={grp} label={grp}>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Nome + Marca + Desc */}
            {[['nome','Nome *',''],['marca','Marca',''],['desc','Especificações','']].map(([k,lbl]) => (
              <div key={k} style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>{lbl}</label>
                <input value={editForm[k]} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }} />
              </div>
            ))}

            {/* Estoque + Custo + Preço */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:13 }}>
              {[['stock','Estoque'],['custo','Custo (R$)'],['preco','À Vista (R$) *']].map(([k,lbl]) => (
                <div key={k}>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:.4, marginBottom:5 }}>{lbl}</label>
                  <input type="number" value={editForm[k]} onChange={e=>setEditForm(f=>({...f,[k]:e.target.value}))}
                    style={{ width:'100%', padding:'9px 10px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', outline:'none' }} />
                </div>
              ))}
            </div>

            {/* Preview */}
            {editForm.preco && (
              <div style={{ fontSize:11, color:'var(--green)', marginBottom:16, padding:'8px 12px', background:'var(--green-dark)', borderRadius:7 }}>
                À vista: <strong>{fmtBRL(parseFloat(editForm.preco)||0)}</strong> &nbsp;·&nbsp;
                12x de <strong>{fmtBRL(prazoPreco(parseFloat(editForm.preco)||0)/12)}</strong> (+10%)
              </div>
            )}

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={() => setEditModal(null)}
                style={{ padding:'9px 20px', border:'1px solid var(--border2)', borderRadius:'var(--radius)', background:'transparent', color:'var(--text2)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
              <button onClick={saveEdit}
                style={{ padding:'9px 20px', border:'none', borderRadius:'var(--radius)', background:'var(--green)', color:'#000', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                💾 Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
