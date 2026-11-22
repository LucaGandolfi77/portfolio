/**
 * forms.js — definizione dei tipi di contenuto e mapping con i tipi rilevati.
 * Dati puri, importabili dai test senza DOM.
 */

export const TYPES = [
  {
    id: 'link',
    icon: 'link',
    fields: [
      {
        name: 'url',
        type: 'url',
        label: 'fieldUrl',
        placeholder: 'phUrl',
        inputmode: 'url',
        autocomplete: 'url',
        required: true
      }
    ]
  },
  {
    id: 'text',
    icon: 'text',
    fields: [
      { name: 'text', control: 'textarea', rows: 4, label: 'fieldText', placeholder: 'phText' }
    ]
  },
  {
    id: 'wifi',
    icon: 'wifi',
    fields: [
      {
        name: 'ssid',
        label: 'fieldSsid',
        placeholder: 'phSsid',
        autocomplete: 'off',
        required: true
      },
      {
        name: 'security',
        control: 'select',
        label: 'fieldSecurity',
        options: [
          { value: 'WPA', label: 'securityWpa' },
          { value: 'WEP', label: 'securityWep' },
          { value: 'nopass', label: 'securityOpen' }
        ],
        refresh: true,
        value: 'WPA'
      },
      {
        name: 'password',
        type: 'password',
        label: 'fieldPassword',
        placeholder: 'phPassword',
        autocomplete: 'off',
        show: (values) => values.security !== 'nopass'
      },
      { name: 'hidden', control: 'checkbox', label: 'fieldHidden' }
    ]
  },
  {
    id: 'contact',
    icon: 'contact',
    fields: [
      {
        name: 'firstName',
        label: 'fieldFirstName',
        placeholder: 'phFirstName',
        autocomplete: 'given-name'
      },
      {
        name: 'lastName',
        label: 'fieldLastName',
        placeholder: 'phLastName',
        autocomplete: 'family-name'
      },
      { name: 'org', label: 'fieldOrg', placeholder: 'phOrg', autocomplete: 'organization' },
      {
        name: 'phone',
        type: 'tel',
        label: 'fieldPhone',
        placeholder: 'phPhone',
        inputmode: 'tel',
        autocomplete: 'tel'
      },
      {
        name: 'email',
        type: 'email',
        label: 'fieldEmail',
        placeholder: 'phEmail',
        inputmode: 'email',
        autocomplete: 'email'
      },
      {
        name: 'url',
        type: 'url',
        label: 'fieldUrl',
        placeholder: 'phUrl',
        inputmode: 'url',
        autocomplete: 'url'
      }
    ]
  },
  {
    id: 'email',
    icon: 'email',
    fields: [
      {
        name: 'to',
        type: 'email',
        label: 'fieldEmail',
        placeholder: 'phEmail',
        inputmode: 'email',
        autocomplete: 'email',
        required: true
      },
      { name: 'subject', label: 'fieldSubject', placeholder: 'phSubject' },
      { name: 'body', control: 'textarea', rows: 3, label: 'fieldBody', placeholder: 'phBody' }
    ]
  },
  {
    id: 'sms',
    icon: 'sms',
    fields: [
      {
        name: 'phone',
        type: 'tel',
        label: 'fieldPhone',
        placeholder: 'phPhone',
        inputmode: 'tel',
        required: true
      },
      { name: 'message', control: 'textarea', rows: 3, label: 'fieldBody', placeholder: 'phBody' }
    ]
  },
  {
    id: 'phone',
    icon: 'phone',
    fields: [
      {
        name: 'phone',
        type: 'tel',
        label: 'fieldPhone',
        placeholder: 'phPhone',
        inputmode: 'tel',
        required: true
      }
    ]
  },
  {
    id: 'geo',
    icon: 'geo',
    fields: [
      {
        name: 'lat',
        label: 'fieldLat',
        placeholder: 'phLat',
        inputmode: 'decimal',
        required: true
      },
      {
        name: 'lng',
        label: 'fieldLng',
        placeholder: 'phLng',
        inputmode: 'decimal',
        required: true
      },
      { name: 'label', label: 'fieldLabel', placeholder: 'phLabel' }
    ],
    extra: 'geo'
  },
  {
    id: 'event',
    icon: 'event',
    fields: [
      {
        name: 'title',
        label: 'fieldEventTitle',
        placeholder: 'phEventTitle',
        autocomplete: 'off',
        required: true
      },
      { name: 'start', type: 'datetime-local', label: 'fieldStart', required: true },
      { name: 'end', type: 'datetime-local', label: 'fieldEnd' },
      { name: 'location', label: 'fieldLocation', placeholder: 'phLocation' },
      {
        name: 'description',
        control: 'textarea',
        rows: 3,
        label: 'fieldDescription',
        placeholder: 'phDescription'
      }
    ]
  }
];

export const FORM_TO_DETECTED = {
  link: 'url',
  text: 'text',
  wifi: 'wifi',
  contact: 'vcard',
  email: 'email',
  sms: 'sms',
  phone: 'tel',
  geo: 'geo',
  event: 'event'
};

export const DETECTED_TO_FORM = {
  url: 'link',
  text: 'text',
  wifi: 'wifi',
  vcard: 'contact',
  email: 'email',
  sms: 'sms',
  tel: 'phone',
  geo: 'geo',
  event: 'event'
};

export const OPEN_TYPES = {
  link: 'url',
  email: 'email',
  sms: 'sms',
  phone: 'tel',
  geo: 'geo'
};

export function typeDefinition(id) {
  return TYPES.find((type) => type.id === id) || TYPES[0];
}
