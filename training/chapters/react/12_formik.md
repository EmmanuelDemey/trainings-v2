---
layout: cover
---

# Formik

--- 

# Formik

* Module permettant de simplifier la gestion d'un formulaire
  * les valeurs
  * son état
  * la validation
  * les événements

```shell
npm i formik
```

---

# useFormik hooks

* L'une des solutions proposées est d'utiliser le hook `useFormik`;

```javascript
import { useFormik } from 'formik';

const SignupFormComponent = () => {
    const formik = useFormik({
     initialValues: {
       email: '',
     },
     onSubmit: values => {
       alert(JSON.stringify(values, null, 2));
     },
    });
    return (
     <form onSubmit={formik.handleSubmit}>
       <label htmlFor="email">Email Address</label>
       <input
         id="email"
         name="email"
         type="email"
         onChange={formik.handleChange}
         value={formik.values.email}
       />

       <button type="submit">Submit</button>
     </form>
    );
};
```

---

# Validation

* Nous pouvons définir une méthode de validation lors de l'initialisation de Formik.

```javascript
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

* Nous pouvons également faire la validation via la création d'un schéma `Yup`

```javascript
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SignupFormComponent = () => {
    const formik = useFormik({
     initialValues: {
       email: '',
     },
     validationSchema: Yup.object({
       email: Yup.string()
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

* Une fois la donnée validée, vous pouvez récupérer son état pour éventuellement afficher
un message d'erreur

```javascript
<input
     id="email"
     name="email"
     type="email"
     onChange={formik.handleChange}
     value={formik.values.email}
    />
{formik.errors.email ? <div>{formik.errors.email}</div> : null}
```
