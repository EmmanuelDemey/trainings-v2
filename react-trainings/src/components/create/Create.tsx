import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as Yup from "yup";
import { Button } from "@components/common";
import { API_BASE_URL } from "../../utils/env";
import { Person } from "@model/person";

const App = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (values: Person) =>
      fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((r) => r.json()),
    onSuccess: ({ id }) => {
      navigate(`/person/${id}`);
    },
  });

  const today = new Date();

  const formik = useFormik({
    initialValues: {
      name: "",
      height: "",
      hairColor: "",
      gender: "",
      birthYear: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      height: Yup.number()
        .typeError("Height must be a number")
        .min(0, "Height must be at least 0")
        .max(250, "Height must be 250 or less")
        .required("Height is required"),
      hairColor: Yup.string().required("Hair color is required"),
      gender: Yup.string().required("Gender is required"),
      birthYear: Yup.date()
        .typeError("Invalid date")
        .max(today, "Birth year must be before today")
        .required("Birth year is required"),
    }),
    onSubmit: (values) => {
      // assume to type approx: as Person
      mutation.mutate(values as Person);
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="box"
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      <div className="field">
        <label className="label" htmlFor="name">
          Name:
        </label>
        <div className="control">
          <input
            type="text"
            id="name"
            name="name"
            className={`input ${formik.touched.name && formik.errors.name ? "is-danger" : ""}`}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        {formik.touched.name && formik.errors.name && (
          <p className="help is-danger">{formik.errors.name}</p>
        )}
      </div>
      <div className="field">
        <label className="label" htmlFor="height">
          Height (cm):
        </label>
        <div className="control">
          <input
            type="number"
            id="height"
            name="height"
            className={`input ${formik.touched.height && formik.errors.height ? "is-danger" : ""}`}
            value={formik.values.height}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        {formik.touched.height && formik.errors.height && (
          <p className="help is-danger">{formik.errors.height}</p>
        )}
      </div>
      <div className="field">
        <label className="label" htmlFor="hairColor">
          Hair Color:
        </label>
        <div className="control">
          <div className="select">
            <select
              id="hairColor"
              name="hairColor"
              value={formik.values.hairColor}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select</option>
              <option value="black">Black</option>
              <option value="brown">Brown</option>
              <option value="blonde">Blonde</option>
              <option value="red">Red</option>
            </select>
          </div>
        </div>
        {formik.touched.hairColor && formik.errors.hairColor && (
          <p className="help is-danger">{formik.errors.hairColor}</p>
        )}
      </div>
      <div className="field">
        <label className="label">Gender:</label>
        <div className="control">
          <label className="radio">
            <input
              type="radio"
              id="male"
              name="gender"
              value="male"
              checked={formik.values.gender === "male"}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            Male
          </label>
          <label className="radio">
            <input
              type="radio"
              id="female"
              name="gender"
              value="female"
              checked={formik.values.gender === "female"}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            Female
          </label>
          <label className="radio">
            <input
              type="radio"
              id="other"
              name="gender"
              value="other"
              checked={formik.values.gender === "other"}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            Other
          </label>
        </div>
        {formik.touched.gender && formik.errors.gender && (
          <p className="help is-danger">{formik.errors.gender}</p>
        )}
      </div>
      <div className="field">
        <label className="label" htmlFor="birthYear">
          Birth Year:
        </label>
        <div className="control">
          <input
            type="date"
            id="birthYear"
            name="birthYear"
            className={`input ${formik.touched.birthYear && formik.errors.birthYear ? "is-danger" : ""}`}
            value={formik.values.birthYear}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </div>
        {formik.touched.birthYear && formik.errors.birthYear && (
          <p className="help is-danger">{formik.errors.birthYear}</p>
        )}
      </div>
      <Button label="Submit" type="submit" disabled={formik.isValidating} />
    </form>
  );
};

export default App;
