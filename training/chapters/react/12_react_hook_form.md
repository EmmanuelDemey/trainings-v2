---
layout: cover
---

# React Hook Form

--- 

# React Hook Form

* Module permettant de simplifier la gestion d'un formulaire
  * les valeurs
  * son état
  * la validation
  * les événements

```shell
npm i react-hook-form
```

---

# React Hook Form - Utilisation 

* Voici un exemple avec hook `useForm`;

```javascript
import { useForm } from "react-hook-form";

type FormData = {
  firstName: string;
  lastName: string;
};

const FormComponent = () => {
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const onSubmit = handleSubmit(data => console.log(data));
  
  return (
    <form onSubmit={onSubmit}>
      <label>First Name</label>
      <input {...register("firstName")} />
      <label>Last Name</label>
      <input {...register("lastName")} />
      <button
        type="button"
        onClick={() => {
          setValue("lastName", "luo"); // ✅
          setValue("firstName", true); // ❌: true is not string
          errors.bill; // ❌: property bill does not exist
        }}
      >
        SetValue
      </button>
      <button>Valider</button>
    </form>
  );
};
```

--- 
# Propriétés retournés par useForm

* Voici une liste partielle des propriétés retournés par le hook *useForm* 
  * register / unregister
  * setValue / reset / resetField
  * formState
  * handleSumit
  * isSubmitting
  * getValues / getFieldState
  * ...

--- 

# Validation

* Nous pouvons définir une méthode de validation lors de l'enregistrement d'un input.

```javascript
import { useForm } from "react-hook-form";

export default function App() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input defaultValue="test" {...register("example")} />
      
      <input {...register("exampleRequired", { required: true })} />
      {errors.exampleRequired && <span>This field is required</span>}
      
      <input type="submit" />
    </form>
  );
}
```

---

# Validation via Yup

* Nous pouvons également faire la validation via la création d'un schéma `Yup`

```javascript
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const schema = yup.object({
  firstName: yup.string().required(),
  age: yup.number().positive().integer().required(),
}).required();

export default function App() {
  const { register, handleSubmit, formState:{ errors } } = useForm({
    resolver: yupResolver(schema)
  });
  const onSubmit = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} />
      <p>{errors.firstName?.message}</p>
        
      <input {...register("age")} />
      <p>{errors.age?.message}</p>
      
      <input type="submit" />
    </form>
  );
}
```

---
layout: cover
---

# Travaux Pratiques
