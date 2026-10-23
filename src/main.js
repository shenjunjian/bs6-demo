import './scss/styles.scss'
import * as bootstrap from 'bootstrap'

window.bootstrap = bootstrap

const root = document.documentElement
const demoDialog = document.getElementById('demoDialog')
const demoForm = document.getElementById('demoForm')
const dialogStatus = document.getElementById('dialogStatus')
const dialogAlerts = document.getElementById('dialogAlertPlaceholder')
const pageAlerts = document.getElementById('pageAlertPlaceholder')
const pageToastBody = document.getElementById('pageToastBody')
const demoResult = document.getElementById('demoResult')
const demoNotes = document.getElementById('demoNotes')
const demoNotesCount = document.getElementById('demoNotesCount')
const demoRange = document.getElementById('demoRange')
const demoRangeValue = document.getElementById('demoRangeValue')
const demoActionValue = document.getElementById('demoActionValue')
const demoPassword = document.getElementById('demoPassword')
const togglePassword = document.getElementById('togglePassword')

document.getElementById('bsVersion').textContent = `Bootstrap ${bootstrap.Tooltip.VERSION}`

const themeToggle = document.getElementById('themeToggle')
themeToggle.addEventListener('click', () => {
  const nextTheme = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark'
  root.setAttribute('data-bs-theme', nextTheme)
  themeToggle.textContent = nextTheme === 'dark' ? '浅色模式' : '深色模式'
})

function createAlert(container, message, theme = 'primary') {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert theme-${theme}" role="alert">`,
    `  <p>${message}</p>`,
    '  <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="关闭"></button>',
    '</div>'
  ].join('')
  container.append(wrapper)
  const alertElement = wrapper.firstElementChild
  alertElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  return alertElement
}

function autoClose(alertElement, delay = 6000) {
  window.setTimeout(() => {
    if (alertElement.isConnected) {
      bootstrap.Alert.getOrCreateInstance(alertElement).close()
    }
  }, delay)
}

document.getElementById('openDialogByJs').addEventListener('click', () => {
  bootstrap.Dialog.getOrCreateInstance(demoDialog).show()
})

const dialogStatusText = {
  'show.bs.dialog': '正在打开…',
  'shown.bs.dialog': '已打开',
  'hide.bs.dialog': '正在关闭…',
  'hidden.bs.dialog': '已关闭',
  'hidePrevented.bs.dialog': '被静态背景拦截（hidePrevented）',
  'cancel.bs.dialog': '被 Esc 取消（cancel）'
}

for (const [eventName, text] of Object.entries(dialogStatusText)) {
  demoDialog.addEventListener(eventName, () => {
    dialogStatus.textContent = `Dialog 状态：${text}`
  })
}

document.getElementById('dialogAlertBtn').addEventListener('click', () => {
  const time = new Date().toLocaleTimeString('zh-CN')
  autoClose(createAlert(dialogAlerts, `动态插入的 alert（${time}），6 秒后自动关闭。`, 'success'))
})

document.getElementById('dialogToastBtn').addEventListener('click', () => {
  bootstrap.Toast.getOrCreateInstance(document.getElementById('dialogToast')).show()
})

togglePassword.addEventListener('click', () => {
  const reveal = demoPassword.type === 'password'
  demoPassword.type = reveal ? 'text' : 'password'
  togglePassword.textContent = reveal ? '隐藏' : '显示'
  demoPassword.focus()
})

demoNotes.addEventListener('input', () => {
  demoNotesCount.textContent = String(demoNotes.value.length)
})

demoRange.addEventListener('input', () => {
  demoRangeValue.textContent = demoRange.value
})

for (const menuItem of document.querySelectorAll('[data-demo-action]')) {
  menuItem.addEventListener('click', () => {
    demoActionValue.value = menuItem.dataset.demoAction
  })
}

function collectFormData(form) {
  const formData = new FormData(form)
  const data = {}

  for (const key of new Set(formData.keys())) {
    const values = formData.getAll(key).filter(value => value !== '')
    data[key] = values.length > 1 ? values : values[0] ?? null
  }

  return data
}

function resetComboboxes(form) {
  for (const toggle of form.querySelectorAll('[data-bs-toggle="combobox"]')) {
    const valueDisplay = toggle.querySelector('.combobox-value')

    if (valueDisplay) {
      valueDisplay.textContent = toggle.dataset.bsPlaceholder ?? ''
      valueDisplay.classList.add('combobox-placeholder')
    }

    const hiddenInput = form.querySelector(`input[type="hidden"][name="${toggle.dataset.bsName}"]`)

    if (hiddenInput) {
      hiddenInput.value = ''
    }

    for (const item of toggle.parentElement.querySelectorAll('.menu-item.selected')) {
      item.classList.remove('selected')
      item.removeAttribute('aria-selected')
    }
  }
}

demoForm.addEventListener('submit', event => {
  event.preventDefault()
  dialogAlerts.replaceChildren()

  if (!demoForm.checkValidity()) {
    const invalidFields = [...demoForm.querySelectorAll(':invalid')]
      .filter(field => field.matches('input, select, textarea'))
    autoClose(createAlert(dialogAlerts, `校验未通过：还有 ${invalidFields.length} 个字段需要修正。`, 'danger'), 8000)
    const firstInvalid = invalidFields[0]

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })

      if (!firstInvalid.matches('[data-bs-toggle="datepicker"]')) {
        firstInvalid.focus({ preventScroll: true })
      }
    }

    return
  }

  const data = collectFormData(demoForm)

  if (data.password) {
    data.password = '*'.repeat(String(data.password).length)
  }

  bootstrap.Dialog.getOrCreateInstance(demoDialog).hide()
  demoResult.textContent = JSON.stringify(data, null, 2)
  pageAlerts.replaceChildren()
  pageToastBody.textContent = `${data.name ?? '匿名'}，表单数据已在浏览器内解析完成。`
  autoClose(createAlert(pageAlerts, '提交成功！下方是序列化后的表单数据。', 'success'), 8000)
  bootstrap.Toast.getOrCreateInstance(document.getElementById('pageToast')).show()
})

demoForm.addEventListener('reset', () => {
  window.setTimeout(() => {
    dialogAlerts.replaceChildren()
    demoNotesCount.textContent = '0'
    demoRangeValue.textContent = demoRange.value
    demoActionValue.value = '（无）'
    togglePassword.textContent = '显示'
    demoPassword.type = 'password'
    resetComboboxes(demoForm)
  })
})
