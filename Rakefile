task :style do
  sh "charites build style/style.yml docs/style.json"
end

task :download do
  %w{https://unpkg.com/intersection-observer@0.5.1/intersection-observer.js https://unpkg.com/scrollama@2.2.3/build/scrollama.js}.each {|url|
    sh "curl -o docs/#{url.split('/')[-1]} #{url}"
  }
end

task :host do
  sh "budo -d docs" # you need UNVT, such as equinox or nanban installed.
end

