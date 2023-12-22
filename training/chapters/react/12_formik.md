---
layout: cover
---

# Formik

---

# Formik

- Module permettant de simplifier la gestion d'un formulaire
  - les valeurs
  - son état
  - la validation
  - les événements

```shell
npm i formik
```

---

# Formik - Utilisation

- Nous avons trois syntaxes pour utiliser **Formik** dans une application
  - Utilisation d'un composant React **Formik**
  - Utilisation d'un jook **useFormik**
  - Utilisation d'un HOC **withFormik**

---

# Formik - Utilisation

- Voici un exemple avec le composant `Formik`;

```typescript
import { Formik } from 'formik';

const SignupFormComponent = () => {
    return (
     <Formik
        initialValues={{
          email: '',
        }}
        onSubmit={values => ... }
     >{({
        handleSubmit, handleChange, values
      }) => (
      <form onSubmit={handleSubmit}>
        <label>
          Email Address
          <input
            name="email"
            type="email"
            onChange={handleChange}
            value={values.email}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
      )}</Formik>
    );
};
```

---

# useFormik hook

- Voici un exemple similaire via l'utilisation du hook `useFormik`;

```typescript
import { useFormik } from 'formik';

const SignupFormComponent = () => {
    const formik = useFormik({
     initialValues: {
       email: '',
     },
     onSubmit: values => { ... },
    });
    return (
     <form onSubmit={formik.handleSubmit}>
       <label>
        Email Address
        <input
          name="email"
          type="email"
          onChange={formik.handleChange}
          value={formik.values.email}
        />
       </label>

       <button type="submit">Submit</button>
     </form>
    );
};
```

---

# withFormik

- Voici un exemple similaire via l'utilisation du HOC `withFormik`;

```typescript
import { withFormik } from 'formik';

const SignupFormComponent = ({ handleSubmit, handleChange, values}) => {
    return (
     <form onSubmit={handleSubmit}>
       <label>
        Email Address
        <input
          id="email"
          name="email"
          type="email"
          onChange={handleChange}
          value={values.email}
        />
       </label>

       <button type="submit">Submit</button>
     </form>
    );
};
export default withFormik({
  initialValues: { email: '' },
  onSubmit: values => { ... },
})(SignupFormComponent)
```

---

# Propriétés retournés par useFormik et Formik

- Voici une liste partielle des propriétés retournés par le hook _useFormik_ ou le composant _Formik_
  - values
  - errors
  - touched
  - handleChange
  - handleBlur
  - handleSubmit
  - isSubmitting

---

# Validation

- Nous pouvons définir une méthode de validation lors de l'initialisation de Formik.

```typescript
import { useFormik } from 'formik';

const SignupFormComponent = () => {
    const formik = useFormik({
     initialValues: {
       email: '',
     },
    validate: values => {
      const errors = {}
      if(!values.email){
          errors.email = "L'email est obligatoire"
      }
      return errors;
    },
     onSubmit: values => {
       alert(JSON.stringify(values, null, 2));
     },
    });
    return ...;
};
```

---

# Validation via Yup

- Nous pouvons également faire la validation via la création d'un schéma `Yup`

```typescript
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SignupFormComponent = () => {
    const formik = useFormik({
     initialValues: {
       email: '',
     },
     validationSchema: Yup.object({
       email: Yup.string().email()
         .required("L'email est obligatoire"),
     }),
     onSubmit: values => {
       alert(JSON.stringify(values, null, 2));
     },
    });
    return ...;
};
```

---

# Object errors

- Une fois la donnée validée, vous pouvez récupérer son état pour éventuellement afficher
  un message d'erreur

```javascript
<input id="email" name="email" type="email" onChange={formik.handleChange} value={formik.values.email} />;
{
  formik.errors.email ? <div>{formik.errors.email}</div> : null;
}
```

---

# useField

- Nous pouvons intéragir avec le composant **Formik** dans un composant enfant, via l'utilisation du hook _useField_ (merci le **Context**).

```typescript
import React from "react";
import { useField, Form, FormikProps, Formik } from "formik";

const MyTextField = ({ label, ...props }) => {
  const [field, meta, helpers] = useField(props);
  return (
    <>
      <label>
        {label}
        <input {...field} {...props} />
      </label>
      {meta.touched && meta.error ? <div className="error">{meta.error}</div> : null}
    </>
  );
};
```

---

# useField

```typescript
const Example = () => (
  <div>
    <h1>My Form</h1>
    <Formik ...>
      {(props: FormikProps<Values>) => (
        <Form>
          <MyTextField name="firstName" type="text" label="First Name" />
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  </div>
);
```

---
layout: cover
---

# Travaux Pratiques
