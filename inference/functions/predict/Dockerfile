FROM public.ecr.aws/lambda/python:3.10

# Copy requirements.txt
COPY . ${LAMBDA_TASK_ROOT}

# Install the specified packages
RUN pip install poetry && poetry install

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "lambda_function.handler" ]