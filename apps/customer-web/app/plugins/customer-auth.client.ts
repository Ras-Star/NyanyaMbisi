export default defineNuxtPlugin(() => {
  const { initialize } = useCustomerAuth();
  void initialize();
});
