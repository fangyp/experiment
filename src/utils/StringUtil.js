export const filterString = value => {
  if (value === undefined) {
    return ''
  } else if (value === null) {
    return ''
  } else if (value === 'null') {
    return ''
  } else {
    return value + ''
  }
}

export const isStringEmpty = (value) => {
  if (value === undefined) {
    return true
  } else if (value === null) {
    return true
  } else if (value === 'null') {
    return true
  } else if (value === '') {
    return true
  }
  return false
}

export const filterNumberString = value => {
  if (value === undefined) {
    return '0'
  } else if (value === null) {
    return '0'
  } else if (value === '') {
    return '0'
  } else {
    return value + ''
  }
}

// 生成 32 位唯一键
export const generateUid = () => {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
