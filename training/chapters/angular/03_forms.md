---
layout: cover
---

# Forms

---

# Template Driven Form

---

# Reactive Form

- Plusieurs méthodes sont à votre disposition sur l'objet _FormGroup_

```typescript
@Component({ ... })
export class FormComponent {
  form = inject(FormBuilder).group({
    name: ['Emeline'],
    email: ['emeline@gmail.com', { disabled: true }]
  })

  constructor(){
    console.log(this.form.value); // { name: 'Emeline' }
    console.log(this.form.getRawValue()); // { name: 'Emeline', email: 'emeline@gmail.com' }
  }
}
```

---

# Custom Validators

- Nous pouvons créer nos propres validateurs
  - Doit implémenter l'interface **Validator**
  - Doit implémenter la méthode **validate**
  - Doit s'autoenregistrer dans le token **NG_VALIDATORS**

```typescript
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[ageMin]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: AgeMinDirective,
    multi: true
  }]
})
export class AgeMinDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if(control.value === null || control.value === ''){
      return null;
    }

    if(parseInt(control.value, 10) > 18){
      return null;
    }

    return {
      ageMin: {
        ageTooYoung: true
      }
    }
  }
}
```
