// TODO: encapsulate
import { FormControl, Box } from "@mui/material";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as Yup from "yup";
import { Input, Button, Select, Radio, Datepicker } from "@components/common";
import { API_BASE_URL } from "../../utils/env";
import { Person } from "@model/person";

const HAIR_OPTIONS = [
  { label: "Black", value: "black" },
  { label: "Brown", value: "brown" },
  { label: "Blonde", value: "blonde" },
  { label: "Red", value: "red" },
];

const SEX_OPTIONS = [
  { label: "Man", value: "man" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const Create = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (values: Person) => {
      console.log(values);
      return fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }).then((r) => r.json());
    },
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
    <FormControl
      variant="outlined"
      margin="dense"
      sx={{ width: "40%", minWidth: "100px" }}
    >
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Input
          id="name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          label={"Name"}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.name ? formik.errors.name : ""}
        />
        <Input
          type="number"
          id="height"
          name="height"
          value={formik.values.height}
          onChange={formik.handleChange}
          label={"Height"}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.height ? formik.errors.height : ""}
        />
        <Select
          id="hairColor"
          name="hairColor"
          label="Hair color"
          value={formik.values.hairColor}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          options={HAIR_OPTIONS}
          errorMessage={formik.touched.hairColor ? formik.errors.hairColor : ""}
        />
        <Radio
          id="gender"
          name="gender"
          label="Gender"
          value={formik.values.gender}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          options={SEX_OPTIONS}
          errorMessage={formik.touched.gender ? formik.errors.gender : ""}
        />
        <Datepicker
          id="birthYear"
          name="birthYear"
          label="Gender"
          value={formik.values.birthYear}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={formik.touched.birthYear ? formik.errors.birthYear : ""}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
            width: "100%",
            marginTop: "20px",
          }}
        >
          <Button onClick={() => navigate("/")} label={"Back to home"} />
          <Button type="submit" disabled={!formik.isValid} label={"Submit"} />
        </Box>
      </Box>
    </FormControl>
  );
};

export default Create;
