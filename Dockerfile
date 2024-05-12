FROM public.ecr.aws/lambda/nodejs:20
COPY . /var/task
RUN npm install
CMD ["index.handler"]